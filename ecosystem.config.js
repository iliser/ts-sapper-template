module.exports = {
    apps : [{
      // TODO specify name
      name: 'medic.bwadm.ru',
      script: '__sapper__/build',
      
      // need to "absolute" import like import config from 'config' work corectly why run from node
      node_args: '',
      args: '',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT:3071
      },
      env_production: {
        NODE_ENV: 'production',
        PORT:3071
      }
    }],
    deploy:{
      production:{
        // TODO specify params
        user:"ssh_username",
        host:["ssh_host"],
        ref:"origin/master",
        repo:"git ssh repo",
        path:"path on remote machine",
        "post-deploy":"pnpm i && npm run build && pm2 start ecosystem.config.js --env production"
      }
    }
  };