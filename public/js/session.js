const api_key = document.getElementById('api_key').value;
const session_id = document.getElementById('session_id').value;
const token = document.getElementById('token').value;
let archive_id;
let session;

// Handling all of our errors here by alerting them
const handleError = (error) => {
  if (error) {
    alert(error.message);
  }
};

const initializeSession = () => {
  if (OT.checkSystemRequirements() !== 1) {
    // TODO どうやって確認するかな
    alert("サポート対象外のブラウザです");
    return;
  }

  session = OT.initSession(api_key, session_id);
  // 切断時の各種イベントハンドリング
  session.on("sessionDisconnected", (event) => {
    // The event is defined by the SessionDisconnectEvent class
    if (event.reason === "clientDisconnected") {
      alert("通話相手が切断したため、切断しました")
    }
    if (event.reason === "forceDisconnected") {
      // 本当はもっと優しいアラートにしたほうがよさそう
      alert("モデレーターにより、切断されました")
    }
    if (event.reason === "networkDisconnected") {
      alert("ネットワークの影響により、切断されました")
    }
  });
  
  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    session.subscribe(event.stream, 'subscriber', {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    }, handleError);
  });
  
  // Create a publisher
  const publisher = OT.initPublisher('publisher', {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  }, handleError);
  
  // Connect to the session
  session.connect(token, function(error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });
};

// 画面共有の処理
const shareScreen = () => {
  OT.checkScreenSharingCapability((response) => {
    if(!response.supported || response.extensionRegistered === false) {
      // This browser does not support screen sharing.
      // ScreenSharing対象外ブラウザ準備できないので未確認
      alert('画面共有対象外ブラウザです。Chromeをご利用ください');
    } else if (response.extensionInstalled === false) {
      // Prompt to install the extension.
      // 古のChrome用意してまで確認するべきことでもないので、未確認
      alert('画面共有には拡張機能が必要です');
    } else {
      // Screen sharing is available. Publish the screen.
      const publisher = OT.initPublisher('screen-preview',
        {videoSource: 'screen'},
        (error) => {
          if (error) {
            // Look at error.message to see what went wrong.
          } else {
            session.publish(publisher, (error) => {
              if (error) {
                // Look error.message to see what went wrong.
              }
            });
          }
        }
      );
    }
  });
};

// 録画開始の処理
const startArchive = () => {
  toggleArchiveButton(true);
  const param = JSON.stringify({session_id: session_id});
  fetch('/startArchive', {
    method: 'POST',
    body: param,
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  // {id: "8e147fe3-1fc3-41b2-b187-5748af5e42c8"}
    // TODO archive_idを設定
    .then((response) => {
      archive_id = response.id;
    })
    .catch(error => console.error('Error:', error));
};

// 録画停止の処理
const stopArchive = () => {
  toggleArchiveButton(false);
  fetch('/stopArchive', {
    method: 'POST',
    body: JSON.stringify({archive_id: archive_id}),
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(error => console.error('Error:', error));
};

const toggleArchiveButton = (flag) => {
  if (flag) {
    document.getElementById('start').style = 'display:none';
    document.getElementById('stop').style = 'display:block';
  } else {
    document.getElementById('start').style = 'display:block';
    document.getElementById('stop').style = 'display:none';
  }
};

initializeSession();
