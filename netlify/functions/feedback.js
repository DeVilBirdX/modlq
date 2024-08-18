const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.Tulen_Daccau });

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        try {
            const { feedback } = JSON.parse(event.body);
            const content = Buffer.from(feedback).toString('base64');
            const repo = 'DeVilBirdX/modlq';  
            let filePath = 'PHANHOIMOD.txt';

            while (true) {
                try {
                    await octokit.repos.getContent({
                        owner: 'DeVilBirdX',
                        repo,
                        path: filePath
                    });
                    
                    const match = filePath.match(/(\d+)?\.txt$/);
                    const num = match[1] ? parseInt(match[1], 10) : 1;
                    filePath = `PHANHOIMOD${num + 1}.txt`;
                } catch (error) {
                    if (error.status === 404) {
                        break;
                    }
                    throw error; 
                }
            }

            await octokit.repos.createOrUpdateFileContents({
                owner: 'DeVilBirdX',
                repo,
                path: filePath,
                message: 'Add feedback file',
                content
            });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Phản hồi đã được lưu vào ' + filePath })
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