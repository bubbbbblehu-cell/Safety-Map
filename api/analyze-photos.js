// Vercel Serverless Function
const multiparty = require('multiparty');

// 允许的域名（CORS配置）
const allowedOrigins = [
    'https://safety-map-phi.vercel.app',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
];

module.exports = async (req, res) => {
    // 设置CORS头
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: '只支持POST请求'
        });
    }

    try {
        // 解析multipart/form-data
        const form = new multiparty.Form();
        
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const photos = files.photos || [];
        const detectionTypes = fields['detectionTypes[]'] || [];

        if (photos.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请上传图片'
            });
        }

        // 模拟AI分析（在Vercel上，实际应该调用AI服务）
        const results = photos.map((photo, index) => {
            const detectionType = detectionTypes[index] || '通用';
            const hasRisk = Math.random() > 0.6;
            const riskLevel = hasRisk ? (Math.random() > 0.5 ? 'high' : 'medium') : 'low';
            
            return {
                filename: photo.originalFilename,
                detectionType: detectionType,
                analysis: {
                    hasRisk: hasRisk,
                    riskLevel: riskLevel,
                    confidence: Math.random() * 0.3 + 0.7,
                    detectedItems: hasRisk ? ['潜在风险点'] : [],
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
                }
            };
        });

        return res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('分析错误:', error);
        return res.status(500).json({
            success: false,
            message: '分析失败: ' + error.message
        });
    }
};

