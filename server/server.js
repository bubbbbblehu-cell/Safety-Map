const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只支持图片格式：jpeg, jpg, png, gif, webp'));
        }
    }
});

// 检测部位数据
const detectionTypes = {
    '门锁': {
        question: '握住门把手摇晃，是否感觉到明显松动或听到零件撞击声？',
        risk: '门锁松动极可能是被撬动的痕迹，或内部反锁机构已失效。',
        keywords: ['松动', '摇晃', '撞击', '反锁', '撬动']
    },
    '窗户': {
        question: '观察窗外 1 米内是否有空调外机、水管或邻居阳台？',
        risk: '这类外部结构是天然的攀爬踏板，极易发生入室风险。',
        keywords: ['空调外机', '水管', '阳台', '攀爬', '外部结构']
    },
    '镜子': {
        question: '用手指关节敲击镜面，声音是闷响还是空心的脆响？',
        risk: '脆响意味着镜后有空腔，极大概率是"双面镜"偷拍。',
        keywords: ['双面镜', '空腔', '脆响', '偷拍', '镜后']
    },
    '浴室': {
        question: '观察排气扇格栅内部是否有黑色圆孔或红点红光？',
        risk: '通风口是隐藏摄像头的重灾区，红点通常是设备工作灯。',
        keywords: ['排气扇', '通风口', '摄像头', '红点', '格栅']
    },
    '插座': {
        question: '检查正对床铺的插座孔位，是否有反光点或异常缝隙？',
        risk: '改装插座可提供长久电源给针孔设备。',
        keywords: ['插座', '针孔', '反光', '改装', '电源']
    },
    '路由器': {
        question: '路由器背面除了网线，是否有不明的微小孔洞或多余接线？',
        risk: '路由器常被植入网络嗅探或无线传输型偷拍模组。',
        keywords: ['路由器', '孔洞', '接线', '嗅探', '无线传输']
    }
};

// API 路由

// 获取检测部位列表
app.get('/api/detection-types', (req, res) => {
    res.json({
        success: true,
        data: Object.keys(detectionTypes).map(key => ({
            type: key,
            question: detectionTypes[key].question,
            risk: detectionTypes[key].risk
        }))
    });
});

// 获取特定检测部位的详细信息
app.get('/api/detection-types/:type', (req, res) => {
    const type = req.params.type;
    if (detectionTypes[type]) {
        res.json({
            success: true,
            data: detectionTypes[type]
        });
    } else {
        res.status(404).json({
            success: false,
            message: '检测部位不存在'
        });
    }
});

// 图片上传和AI分析
app.post('/api/analyze-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请上传图片'
            });
        }

        const detectionType = req.body.detectionType || '通用';
        const hotelId = req.body.hotelId || null;
        const userId = req.body.userId || 'anonymous';

        // 处理图片：压缩和优化
        const processedFilename = 'processed-' + req.file.filename;
        const processedPath = path.join(uploadDir, processedFilename);
        
        await sharp(req.file.path)
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toFile(processedPath);

        // 调用Coze API进行AI分析（如果配置了API Key），否则使用模拟分析
        const analysisResult = await callCozeAPI(req.file.path, detectionType);

        // 保存分析结果
        const resultData = {
            id: Date.now().toString(),
            userId: userId,
            hotelId: hotelId,
            detectionType: detectionType,
            originalImage: `/uploads/${req.file.filename}`,
            processedImage: `/uploads/${processedFilename}`,
            analysis: analysisResult,
            createdAt: new Date().toISOString()
        };

        // 保存到文件（实际应用中应该保存到数据库）
        const resultsDir = path.join(__dirname, 'results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        fs.writeFileSync(
            path.join(resultsDir, `${resultData.id}.json`),
            JSON.stringify(resultData, null, 2)
        );

        res.json({
            success: true,
            data: resultData
        });

    } catch (error) {
        console.error('分析图片错误:', error);
        res.status(500).json({
            success: false,
            message: '图片分析失败: ' + error.message
        });
    }
});

// 批量上传和分析
app.post('/api/analyze-photos', upload.array('photos', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请上传图片'
            });
        }

        const results = [];
        for (const file of req.files) {
            try {
                const detectionType = req.body.detectionTypes?.[req.files.indexOf(file)] || '通用';
                const analysisResult = await callCozeAPI(file.path, detectionType);
                
                results.push({
                    filename: file.filename,
                    detectionType: detectionType,
                    analysis: analysisResult
                });
            } catch (error) {
                results.push({
                    filename: file.filename,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('批量分析错误:', error);
        res.status(500).json({
            success: false,
            message: '批量分析失败: ' + error.message
        });
    }
});

// 获取分析结果
app.get('/api/analysis/:id', (req, res) => {
    const resultPath = path.join(__dirname, 'results', `${req.params.id}.json`);
    if (fs.existsSync(resultPath)) {
        const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        res.json({
            success: true,
            data: result
        });
    } else {
        res.status(404).json({
            success: false,
            message: '分析结果不存在'
        });
    }
});

// Coze API配置
const COZE_CONFIG = {
    apiUrl: process.env.COZE_API_URL || 'https://api.coze.cn/open_api/v2/chat',
    apiKey: process.env.COZE_API_KEY || '',
    botId: process.env.COZE_BOT_ID || '7588350694353649679',
    spaceId: process.env.COZE_SPACE_ID || '7383534396151693331'
};

// 调用Coze API进行AI分析
async function callCozeAPI(imagePath, detectionType) {
    try {
        if (!COZE_CONFIG.apiKey) {
            console.warn('Coze API Key未配置，使用模拟分析');
            return await simulateAIAnalysis(imagePath, detectionType);
        }

        // 读取图片并转换为base64
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');
        const imageMimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';

        // 构建请求数据（根据Coze API文档格式）
        const requestData = {
            conversation_id: `detection_${Date.now()}`,
            bot_id: COZE_CONFIG.botId,
            user: 'safety-map-user',
            query: `请分析这张${detectionType}的照片，检测是否存在安全隐患。重点关注：${detectionTypes[detectionType]?.risk || '安全风险'}。请严格按照以下JSON格式返回分析结果：
{
  "hasRisk": true/false,
  "riskLevel": "high/medium/low",
  "confidence": 0.0-1.0,
  "detectedItems": ["具体问题1", "具体问题2"],
  "recommendations": ["建议1", "建议2", "建议3"],
  "safetyScore": 0.0-5.0
}`,
            stream: false,
            chat_history: []
        };

        // Coze API可能需要使用form-data格式上传图片
        // 或者使用base64编码的图片URL
        // 根据Coze实际API格式调整
        const formData = new FormData();
        formData.append('conversation_id', requestData.conversation_id);
        formData.append('bot_id', requestData.bot_id);
        formData.append('user', requestData.user);
        formData.append('query', requestData.query);
        formData.append('stream', 'false');
        
        // 添加图片（根据Coze API实际要求）
        // 方式1: 直接上传文件
        formData.append('image', fs.createReadStream(imagePath), {
            filename: path.basename(imagePath),
            contentType: imageMimeType
        });

        // 调用Coze API
        let response;
        try {
            // 尝试使用form-data格式
            response = await axios.post(COZE_CONFIG.apiUrl, formData, {
                headers: {
                    'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
                    ...formData.getHeaders()
                },
                timeout: 30000
            });
        } catch (formDataError) {
            // 如果form-data失败，尝试使用JSON格式（如果Coze支持base64）
            console.log('Form-data格式失败，尝试JSON格式');
            requestData.attachments = [{
                type: 'image',
                content: imageBase64,
                content_type: imageMimeType
            }];
            
            response = await axios.post(COZE_CONFIG.apiUrl, requestData, {
                headers: {
                    'Authorization': `Bearer ${COZE_CONFIG.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
        }

        // 解析Coze返回的结果
        console.log('Coze API响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data) {
            let cozeResponse = response.data;
            
            // 处理不同的响应格式
            if (cozeResponse.data) {
                cozeResponse = cozeResponse.data;
            }
            
            // 尝试从回复中提取JSON
            let analysisResult;
            try {
                // Coze可能返回文本格式的JSON，需要解析
                const textResponse = cozeResponse.content || cozeResponse.answer || cozeResponse.message || JSON.stringify(cozeResponse);
                console.log('Coze返回的文本:', textResponse);
                
                // 尝试提取JSON
                const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        analysisResult = JSON.parse(jsonMatch[0]);
                        console.log('成功解析JSON结果:', analysisResult);
                    } catch (jsonError) {
                        console.warn('JSON解析失败:', jsonError);
                        analysisResult = parseTextResponse(textResponse, detectionType);
                    }
                } else {
                    // 如果没有JSON，尝试解析文本回复
                    console.log('未找到JSON格式，使用文本解析');
                    analysisResult = parseTextResponse(textResponse, detectionType);
                }
            } catch (parseError) {
                console.warn('解析Coze响应失败，使用文本解析:', parseError);
                const textResponse = cozeResponse.content || cozeResponse.answer || cozeResponse.message || '';
                analysisResult = parseTextResponse(textResponse, detectionType);
            }

            return analysisResult;
        } else {
            throw new Error('Coze API返回格式异常: ' + JSON.stringify(response.data));
        }

    } catch (error) {
        console.error('调用Coze API失败:', error.message);
        if (error.response) {
            console.error('API响应状态:', error.response.status);
            console.error('API响应数据:', error.response.data);
        }
        if (error.request) {
            console.error('请求详情:', error.request);
        }
        // 如果API调用失败，回退到模拟分析
        console.log('回退到模拟分析');
        return await simulateAIAnalysis(imagePath, detectionType);
    }
}

// 解析文本格式的回复
function parseTextResponse(text, detectionType) {
    const typeInfo = detectionTypes[detectionType] || {};
    const keywords = typeInfo.keywords || [];
    
    // 简单的文本分析
    const hasRiskKeywords = ['风险', '危险', '异常', '不安全', '隐患', '问题', '可疑'];
    const hasRisk = hasRiskKeywords.some(keyword => text.includes(keyword));
    
    let riskLevel = 'low';
    if (text.includes('高风险') || text.includes('严重')) {
        riskLevel = 'high';
    } else if (text.includes('中等') || text.includes('中等风险')) {
        riskLevel = 'medium';
    } else if (hasRisk) {
        riskLevel = 'medium';
    }

    const detectedItems = keywords.filter(keyword => text.includes(keyword));
    
    return {
        hasRisk: hasRisk,
        riskLevel: riskLevel,
        confidence: 0.75,
        detectedItems: detectedItems,
        recommendations: hasRisk ? [
            '建议立即联系酒店前台',
            '记录详细位置信息',
            '考虑更换房间'
        ] : [
            '未发现明显安全隐患',
            '建议保持警惕',
            '如有异常及时反馈'
        ],
        safetyScore: hasRisk ? (riskLevel === 'high' ? 2.0 : 3.5) : 4.5,
        aiResponse: text // 保存原始AI回复
    };
}

// 模拟AI分析函数（作为备用）
async function simulateAIAnalysis(imagePath, detectionType) {
    // 模拟AI分析延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    const typeInfo = detectionTypes[detectionType] || {};
    const keywords = typeInfo.keywords || [];

    // 模拟检测结果
    const hasRisk = Math.random() > 0.6; // 40% 概率检测到风险
    const riskLevel = hasRisk ? (Math.random() > 0.5 ? 'high' : 'medium') : 'low';
    
    const analysis = {
        hasRisk: hasRisk,
        riskLevel: riskLevel,
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
        detectedItems: hasRisk ? keywords.slice(0, Math.floor(Math.random() * 2) + 1) : [],
        recommendations: hasRisk ? [
            '建议立即联系酒店前台',
            '记录详细位置信息',
            '考虑更换房间'
        ] : [
            '未发现明显安全隐患',
            '建议保持警惕',
            '如有异常及时反馈'
        ],
        safetyScore: hasRisk ? (riskLevel === 'high' ? 2.0 : 3.5) : 4.5,
        isSimulated: true // 标记为模拟结果
    };

    return analysis;
}

// 提供上传文件的静态访问
app.use('/uploads', express.static(uploadDir));

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器内部错误'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 上传目录: ${uploadDir}`);
});
