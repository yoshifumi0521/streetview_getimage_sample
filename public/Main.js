//ユーザーが独自に拡張する部分
Main = function()
{
    //ここから処理がはじまる。
    //canvasを使う。
    // ja_CanvasSet();
    // console.log('position_arr');



    // return;
    //スタートポイント
    var start_point = new google.maps.LatLng(35.728926,139.71038);
    //エンドポイント
    var end_point = new google.maps.LatLng(35.709495,139.733538);

    var position_array;

    var directions_service = new google.maps.DirectionsService();
    var request = {
        origin: start_point,
        destination: end_point,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directions_service.route(request, function(response, status)
    {
        //ルートの取得に成功
        console.log("ルートの取得に成功");
        //位置情報を取得する。
        var overview_paths = response['routes'][0]['overview_path'];
        // console.log(response);
        var streetview_path_array = [];
        for(var i=0,d = overview_paths.length; i < overview_paths.length-1; i++ )
        {
            // console.log(overview_paths[i]);
            //角度を計算する。
            //10までにする。
            // if( i < 20)
            // {
                var direction = geoDirection(overview_paths[i]['d'],overview_paths[i]['e'],overview_paths[i+1]['d'],overview_paths[i+1]['e']);
                var streetview_path = "http://maps.googleapis.com/maps/api/streetview?size=650x650&location="+overview_paths[i]['d']+","+overview_paths[i]['e']+"&heading="+ direction+"&sensor=false";
                streetview_path_array[i] = streetview_path;
            // }
        }
        // console.log(streetview_path_array);

        //画像をすべてロードする。
        ja.imageUnitObj.addEventListener("onLoad",this);
        ja.imageUnitObj.load(streetview_path_array);

        this.onLoad = function()
        {
            window.scrollTo(0, 1); //アドレスバーを消す
            ja.imageUnitObj.removeEventListener("onLoad",this);
            console.log('画像のロード終わる');

            //フォルダを生成する。
            jQuery.post('/start');


            //2秒ごとに表示
            var sleep_time = 1000;
            // 実処理の実行
            act();
            function act(){
                // パラメータが無くなっていれば終了
                if(ja.imageUnitObj.imageArray.length==0) return;
                // 配列の先頭を取得する。
                image = ja.imageUnitObj.imageArray[0];
                //画像を表示
                console.log('表示する');
                //画像を張る
                ja.stage.addChild(image);
                //大きさを調整する。
                image.x = 0;
                image.y = 0;
                image.w = $(window).width();
                image.h = 680;
                //画像を取得する。



                // 処理済みのパラメータ削除
                ja.imageUnitObj.imageArray.shift();
                // 次の回の実行予約
                setTimeout(function(){
                    act();
                }, sleep_time);
                // これで１回の処理は終了
                console.log('一定期間スリープ');
            }




           ;



        };





    });










};

//2点間の位置情報の角度
function geoDirection(lat1, lng1, lat2, lng2) {
    // 緯度経度 lat1, lng1 の点を出発として、緯度経度 lat2, lng2 への方位
    // 北を０度で右回りの角度０～３６０度
    var Y = Math.cos(lng2 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180 - lat1 * Math.PI / 180);
    var X = Math.cos(lng1 * Math.PI / 180) * Math.sin(lng2 * Math.PI / 180) - Math.sin(lng1 * Math.PI / 180) * Math.cos(lng2 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180 - lat1 * Math.PI / 180);
    var dirE0 = 180 * Math.atan2(Y, X) / Math.PI; // 東向きが０度の方向
    if (dirE0 < 0) {
        dirE0 = dirE0 + 360; //0～360 にする。
    }
    var dirN0 = (dirE0 + 90) % 360; //(dirE0+90)÷360の余りを出力 北向きが０度の方向
    return dirN0;
}






