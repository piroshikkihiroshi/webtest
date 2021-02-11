//ServiceWorker
//fetchイベントとは、Webページの更新などが行われた際に発生するイベント
//最低限このイベントを追加すれば、ServiceWorkerが使えるようになります
self.addEventListener('fetch', function(e) {
    // ここは空でもOK
})

//インストール
self.addEventListener('install', function(event) {

});
