const express = require('express');
const router = express.Router();
const env = require('dotenv').config();
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;
const fs = require('fs');
// DB用意するのめんどうなので、一旦テキストファイルで
const session_file_path = './session.json';
const OpenTok = require('opentok');
let opentok;
  
  /* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    css_filename: 'embed',
  });
});

router.get('/embed', (req, res, next) => {
  res.render('embed', {
    css_filename: 'embed',
    embed_id: process.env.EMBED_ID,
    room: req.query.room
  });
});

router.get('/pub', (req, res, next) => {
  opentok = new OpenTok(api_key, api_secret);
  opentok.createSession({mediaMode: "routed"}, (error, session) => {
    if (error) {
      console.log(error);
    } else {
      const session_id = session.sessionId;
      const token = opentok.generateToken(session_id);
  
      // FIXME 重複回避はしていない。同じ部屋に入るための4桁の番号をランダムに発行
      const room_number = (String(Math.random()).substring(2, 6));
      
      let session_info;
      if (fs.existsSync(session_file_path)) {
        session_info = JSON.parse(fs.readFileSync(session_file_path));
      } else {
        session_info = {};
      }
      
      // session_idの保持
      session_info[room_number] = session_id;
      fs.writeFileSync(session_file_path, JSON.stringify(session_info));
      
      res.render('session', {
        title: 'Publishing Session',
        css_filename: 'session',
        api_key: api_key,
        session_id: session_id,
        token: token,
        room_number: room_number,
        test: 'test'
      });
    }
  });
});

router.post('/sub', (req, res, next) => {
  const room_number = req.body.room_number;
  
  const session_info = JSON.parse(fs.readFileSync(session_file_path));
  if (room_number in session_info) {
    // 存在する部屋番号
    const session_id = session_info[room_number];
  
    opentok = new OpenTok(api_key, api_secret);
    const token = opentok.generateToken(session_id);
  
    // 使用したsession_idの削除
    delete session_info[room_number];
    fs.writeFileSync(session_file_path, JSON.stringify(session_info));
  
    res.render('session', {
      title: 'Subscribing Session',
      css_filename: 'session',
      api_key: api_key,
      session_id: session_id,
      token: token,
      room_number: room_number,
    });
  } else {
    // 存在しない部屋番号
    res.render('index', {
      error_message: '入力された部屋番号は存在しません',
    });
  }
});

router.post('/startArchive', (req, res, next) => {
  opentok = new OpenTok(api_key, api_secret);
  opentok.startArchive(req.body.session_id, {}, (error, archive) => {
    return res.json(archive);
  });
});

router.post('/stopArchive', (req, res, next) => {
  opentok = new OpenTok(api_key, api_secret);
  opentok.stopArchive(req.body.archive_id, (error, archive) => {
    return res.json(archive);
  });
});

module.exports = router;
