//ユーザーが独自に拡張する部分
Main = function()
{
    //ここから処理がはじまる。
    //canvasを使う。
    // ja_CanvasSet();
    // console.log('position_arr');


    //沖縄の地点
    var start_point = new google.maps.LatLng(26.331624,127.921188);
    var end_point = new google.maps.LatLng(26.327874,127.957173);
    //スタート地点とエンド地点の経度緯度を表示
    document.getElementById("start_point").value = start_point["d"]+","+start_point["e"];
    document.getElementById("end_point").value = end_point["d"]+","+end_point["e"];

    //GoogleMapを表示
    var map;
    var mapOpt = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: start_point,
        zoom: 12
    };
    map = new google.maps.Map(document.getElementById("map"), mapOpt);

    //スタート地点とエンドポイントにマークをつける。



    return;

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
        // var overview_paths = response['routes'][0]['overview_path'];
        var overview_paths = handleDirectionsRoute(response);
        console.log(overview_paths);
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
        console.log(streetview_path_array.length);

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
            var sleep_time = 200;
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

var handleDirectionsRoute = function(response) {

    var route = response.routes[0];
    var _max_points =100;
    var _distance_between_points = 5;
    // var pointOnLine =
    var path = route.overview_path;
    // console.log("はじめの点の数"+path.length);
    // console.log(path);
    var _raw_points = [];
    var legs = route.legs;


    var total_distance = 0;
    for(var i=0; i<legs.length; ++i) {
        total_distance += legs[i].distance.value;
    }

    var segment_length = total_distance/_max_points;
    _d = (segment_length < _distance_between_points) ? _d = _distance_between_points : _d = segment_length;

    var d = 0;
    var r = 0;
    var a, b;

    for(i=0; i<path.length; i++) {
        if(i+1 < path.length) {
            a = path[i];
            b = path[i+1];
            d = google.maps.geometry.spherical.computeDistanceBetween(a, b);
            if(r > 0 && r < d) {

                a = pointOnLine(r/d, a, b);

                d = google.maps.geometry.spherical.computeDistanceBetween(a, b);
                _raw_points.push(a);

                r = 0;
            } else if(r > 0 && r > d) {
                r -= d;
            }

            if(r === 0) {

                var segs = Math.floor(d/_d);

                if(segs > 0) {
                    for(var j=0; j<segs; j++) {
                        var t = j/segs;

                        if( t>0 || (t+i)===0  ) { // not start point
                            var way = pointOnLine(t, a, b);
                            _raw_points.push(way);
                        }
                    }

                    r = d-(_d*segs);
                } else {
                    r = _d*( 1-(d/_d) );
                }
            }

        }
        else
        {
            _raw_points.push(path[i]);
        }
    }

    // parsePoints(response);

    return _raw_points;
};

var pointOnLine = function(t, a, b) {
    var lat1 = a.lat().toRad(), lon1 = a.lng().toRad();
    var lat2 = b.lat().toRad(), lon2 = b.lng().toRad();

    x = lat1 + t * (lat2 - lat1);
    y = lon1 + t * (lon2 - lon1);

    return new google.maps.LatLng(x.toDeg(), y.toDeg());
};

//toRadファンクションを追加した。
if(typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
}

if(typeof(Number.prototype.toDeg) === "undefined") {
    Number.prototype.toDeg = function() {
        return this * 180 / Math.PI;
    }
}


