module.exports = {
  apps : [{
    // TODO change project name
    name: 'PROJECT_NAME',
    script: 'dist/server.js',
    
    // need to "absolute" import like import config from 'config' work corectly why run from node
    node_args: '-r ./tsconfig-path-bootstrap.js',
    args: '',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // TODO change port
    env: {
      NODE_ENV: 'development',
      PORT:3060
    },
    env_production: {
      NODE_ENV: 'production',
      PORT:3060
    }
  }],
  deploy:{
    production:{
      user:"iliser",
      host:["s5.ibb.su"],
      ref:"origin/master",
      // TODO set deploy settings
      repo:"git@github.com:iliser/vp-backend.git",
      path:"/home/iliser/vp/test-back",
      "post-deploy":"pnpm i && npm run build && pm2 start ecosystem.config.js --env production"
    }
  }
};