const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.Tulen_Daccau });

exports.handler = async () => {
    try {
        const repo = 'DeVilBirdX/modlq';
        const { data: files } = await octokit.repos.getContent({
            owner: 'DeVilBirdX',
            repo,
            path: 'comments'
        });

        const comments = await Promise.all(
            files.map(async file => {
                const { data } = await octokit.repos.getContent({
                    owner: 'DeVilBirdX',
                    repo,
                    path: file.path
                });
                return Buffer.from(data.content, 'base64').toString('utf-8');
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify(comments)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Có lỗi xảy ra: ' + error.message })
        };
    }
};