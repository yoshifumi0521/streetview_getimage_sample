//ユーザーが独自に拡張する部分
Main = function()
{
    //ここから処理がはじまる。
    var streetview = new StreetView();
    // console.log(streetview);


};

//ストリートビューのオブジェクト
StreetView = function()
{
    console.log("StreetViewオブジェクトを取得する。");
    //はじめにする処理。
    var self = this;
    //ストリートビューをいれる緯度経度をいれる配列
    var position_array;
    var is_loading = false;
    var overview_paths;
    var streetview_path_array = [];
    var domain = location.href.split('/')[2];
    if(domain = "localhost:4567")
    {
        //ローカルhttp://localhost:4567
        var app_key = "AIzaSyCc74DjkQmdoqAEPfiqVWKNOB8AS7JfDGI";
    }
    else
    {
        //herokuのhttp://blooming-atoll-7041.herokuapp.com
        var app_key =　"AIzaSyDQOgy8kH0MtRaDpIT7rnq0dU33cglxOFU";
    }

    //沖縄の地点をデフォルトに設定する。
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
    var directions_display = new google.maps.DirectionsRenderer();
    directions_display.setMap(map);

    //スタート地点とエンドポイントにマークをつける。
    var start_point_marker = new google.maps.Marker({
        position: start_point,
        map: map,
        title: "スタート地点",
        draggable: true
        // icon: "http://maps.google.com/mapfiles/marker_black.png"
    });
    var start_point_window = new google.maps.InfoWindow({
        content: "スタート地点",
        maxWidth: 100
    });
    start_point_window.open(map,start_point_marker);
    var end_point_marker = new google.maps.Marker({
        position: end_point,
        map: map,
        title: "エンド地点",
        draggable: true
    });
    var end_point_window = new google.maps.InfoWindow({
        content: "エンド地点",
        maxWidth: 100
    });
    end_point_window.open(map,end_point_marker);
    //マーカーを動かしたらする処理。
    google.maps.event.addListener(start_point_marker,"dragend",function(e)
    {
        start_point["d"] = e["latLng"]["d"];
        start_point["e"] = e["latLng"]["e"];
        var position = e["latLng"]["d"]+","+e["latLng"]["e"];
        document.getElementById("start_point").value = position;
    });
    google.maps.event.addListener(end_point_marker,"dragend",function(e)
    {
        end_point["d"] = e["latLng"]["d"];
        end_point["e"] = e["latLng"]["e"];
        var position = e["latLng"]["d"]+","+e["latLng"]["e"];
        document.getElementById("end_point").value = position;
    });
    //緯度経度のテキストを変更したらするイベント
    var start_point_text = document.getElementById("start_point");
    start_point_text.addEventListener("change", function(e){
        alert("スタート地点変更");
        parts = start_point_text.value.split(',');
        start_point["d"] = parts[0];
        start_point["e"] = parts[1];
        //マーカーを移動する。
        start_point_marker.position = start_point;
    });
    var end_point_text = document.getElementById("end_point");
    end_point_text.addEventListener("change", function(e){
        alert("エンド地点変更");
        parts = end_point_text.value.split(',');
        end_point["d"] = parts[0];
        end_point["e"] = parts[1];
        //マーカーを移動する。
        end_point_marker.position = end_point;
    });

    //max_pointに関して
    var max_point = document.getElementById("max_point").value;
    //max_pointが変更したらする処理
    var max_point_text = document.getElementById("max_point");
    max_point_text.addEventListener("change", function(e){
        alert("max_point変更");
        max_point = document.getElementById("max_point").value;
    });

    //画像保存に関して
    var save_image_flag = document.getElementById("save_image").checked;
    var save_image_checkbox = document.getElementById("save_image");
    save_image_checkbox.addEventListener("change", function(e){
        alert("画像保存を変更");
        save_image_flag = document.getElementById("save_image").checked;
    });

    //generateボタンを押したらする処理
    var generate_button = document.getElementById("generate");
    generate_button.addEventListener("click", function(){
        // console.log(self);
        generate();
    });

    //スタートしたらするメソッド
    var generate = function()
    {
        //ロード中は実行されないようにする。
        if(is_loading == true)
        {
            return;
        }
        console.log("generate開始");
        document.getElementById("state").innerHTML = "ロード中";
        is_loading = true;

        var directions_service = new google.maps.DirectionsService();
        var request = {
            origin: start_point,
            destination: end_point,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directions_service.route(request, function(response, status)
        {
            console.log("ルート取得");
            if(status!= "OK")
            {
                alert("ルートが取得できませんでした");
                return;
            }
            //ルートに色をつける
            directions_display.setDirections(response);
            //位置情報を取得する。
            // var overview_paths = response['routes'][0]['overview_path'];
            overview_paths = handleDirectionsRoute(response);
            document.getElementById("frame").innerHTML = overview_paths.length;

            for(var i=0,d = overview_paths.length; i < overview_paths.length-1; i++ )
            {
                var direction = geoDirection(overview_paths[i]['d'],overview_paths[i]['e'],overview_paths[i+1]['d'],overview_paths[i+1]['e']);
                var streetview_path = "http://maps.googleapis.com/maps/api/streetview?size=650x650&location="+overview_paths[i]['d']+","+overview_paths[i]['e']+"&heading="+ direction+"&sensor=false&key="+app_key;
                streetview_path_array[i] = streetview_path;
            }


            if(save_image_flag == true)
            {
                console.log("すでにあるディレクトリを削除して、新しいディレクトリを保存");
                //ディレクトリを作成
                var from = start_point["d"]+","+start_point["e"];
                var to = end_point["d"]+","+end_point["e"];
                jQuery.post("/start/from/"+from +"/to/"+to+"/frame/"+max_point);

                for(var i=0,d = streetview_path_array.length; i < overview_paths.length-1; i++ )
                {
                    jQuery.post(
                        "/save",
                        {from: from,to: to,count: i+1,url: streetview_path_array[i],frame: max_point}
                    );
                }
            }

            // return;
            //画像をすべてロードする。
            ja.imageUnitObj.addEventListener("onLoad",this);
            ja.imageUnitObj.load(streetview_path_array);

            this.onLoad = function()
            {
                window.scrollTo(0, 1); //アドレスバーを消す
                ja.imageUnitObj.removeEventListener("onLoad",this);
                console.log('画像のロード終わる');
                document.getElementById("state").innerHTML = "表示中";
                //フォルダを生成する。
                // jQuery.post('/start');

                //2秒ごとに表示
                var sleep_time = 200;
                // 実処理の実行
                var count = 1;
                act();
                function act()
                {
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
                    // if(save_image_flag == true)
                    // {
                    //     // var image = document.getElementById('ja_canvas').toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '');
                    //     // var image = document.getElementById('ja_canvas').toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '');
                    //     // jQuery.post("/save/from/"+from +"/to/"+to,
                    //     // {
                    //     //     image: image,
                    //     //     index: count
                    //     // });
                    //     //canvasの画像を作成
                    //     var img　=　new Image();
                    //     var type = 'image/jpeg';
                    //     // img.crossOrigin = "Anonymous";
                    //     img.src = document.getElementById('ja_canvas').toDataURL(type);
                    //     console.log(img.src);
                    //     // img.onload = function(){
                    //     // //例：現在のウィンドウに出力。
                    //     //     location.href = img.src;
                    //     // };
                    //     // var image = document.getElementById('ja_canvas').toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '');
                    //     // jQuery.post("/save/from/"+from +"/to/"+to,
                    //     // {
                    //     //     image: image,
                    //     //     index: i
                    //     // });
                    // }
                    // 処理済みのパラメータ削除
                    ja.imageUnitObj.imageArray.shift();
                    // 次の回の実行予約
                    setTimeout(function(){
                        act();
                    }, sleep_time);
                    // これで１回の処理は終了
                    console.log('一定期間スリープ');
                    count++;
                }

            };

            //画像すべて表示したら。is_loadingをfalseにする。
            is_loading = false;







        });

    }

    var handleDirectionsRoute = function(response) {
        var route = response.routes[0];
        // var _max_points = 100;
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

        var segment_length = total_distance/max_point;
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
        return _raw_points;
    };



}






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


