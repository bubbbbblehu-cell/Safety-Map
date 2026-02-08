const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
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

        // 模拟AI分析（实际应用中应该调用真实的AI服务）
        const analysisResult = await simulateAIAnalysis(req.file.path, detectionType);

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
                const analysisResult = await simulateAIAnalysis(file.path, detectionType);
                
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

// 模拟AI分析函数
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
        safetyScore: hasRisk ? (riskLevel === 'high' ? 2.0 : 3.5) : 4.5
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
