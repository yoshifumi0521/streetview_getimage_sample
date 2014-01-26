#main.rb
require "sinatra"
require 'sinatra/reloader'
require 'sinatra/cross_origin'
# enable :cross_origin
require 'fileutils'
require 'base64'

configure do
  enable :cross_origin
end


get '/' do
  cross_origin
  erb :index
end

#フォルダを作成する。
post '/start/from/:start_point/to/:end_point' do
  # FileUtils.rm_rf('data')
  #削除する。
  name = params[:start_point]+"-"+params[:end_point];
  FileUtils.rm_rf("data/"+name);
  #新しい画像を作成
  FileUtils.mkdir_p("data/"+name)
end

post '/save/from/:start_point/to/:end_point' do
    # p params[:start_point]
  # FileUtils.mkdir_p('data')
  name = params[:start_point]+"-"+params[:end_point];
  filename = "%08d.jpg"%params[:index]
  File.open("data/#{name}/#{filename}", 'wb') do |f|
    f.write Base64.decode64(params[:image])
  end
  response.headers['Access-Control-Allow-Origin'] = '*'
end


