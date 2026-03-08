const axios = require('axios');

async function testAPI() {
    try {
        console.log('测试服务器健康检查...');
        const healthResponse = await axios.get('http://localhost:3001/health');
        console.log('✅ 健康检查成功:', healthResponse.data);
        
        console.log('\n测试API路由...');
        const FormData = require('form-data');
        const fs = require('fs');
        
        // 创建一个测试图片（1x1像素的PNG）
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        
        const formData = new FormData();
        formData.append('photos', testImageBuffer, { filename: 'test.png' });
        formData.append('detectionTypes[]', '门锁');
        
        const apiResponse = await axios.post('http://localhost:3001/api/analyze-photos', formData, {
            headers: formData.getHeaders()
        });
        
        console.log('✅ API调用成功!');
        console.log('响应数据:', JSON.stringify(apiResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testAPI();
















