module.exports = {
    apps: [{
        name: 'course-payment',
        script: 'server.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
            PORT: 3000,
            BASE_PATH: ''
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000,
            BASE_PATH: '/embedded-course'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }],

    deploy: {
        production: {
            user: 'ubuntu',
            host: 'your-server-ip',
            ref: 'origin/main',
            repo: 'git@github.com:yourusername/course_pay.git',
            path: '/home/ubuntu/course_pay',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
}; 