const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.Tulen_Daccau });

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        try {
            const { feedback } = JSON.parse(event.body);
            if (!feedback) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Feedback không hợp lệ.' })
                };
            }
            const content = Buffer.from(feedback).toString('base64');
            const repo = 'DeVilBirdX/modlq';  
            const filePath = `comments/${Date.now()}.txt`;  

            await octokit.repos.createOrUpdateFileContents({
                owner: 'DeVilBirdX',
                repo,
                path: filePath,
                message: 'Add feedback file',
                content
            });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Phản hồi đã được lưu!' })
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Có lỗi xảy ra: ' + error.message })
            };
        }
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }
};