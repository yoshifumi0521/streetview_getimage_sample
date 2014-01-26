#main.rb
require "sinatra"
require 'sinatra/reloader'
# require 'sinatra/cross_origin'
require 'fileutils'
require 'base64'
require 'open-uri'

# configure do
#   enable :cross_origin
# end

get '/' do
  # cross_origin
  erb :index
end

#フォルダを作成する。
post '/start/from/:start_point/to/:end_point' do
  # FileUtils.rm_rf('data')
  FileUtils.mkdir_p("data") unless FileTest.exist?("data")
  #削除する。
  name = "from"+params[:start_point]+"to"+params[:end_point];
  FileUtils.rm_rf("data/"+name);
  #新しい画像を作成
  FileUtils.mkdir_p("data/"+name)
end

post '/save' do
  name = "from"+params[:from]+"to"+params[:to];
  fileName = "%08d.jpg"%params[:count]
  dirName = "data/#{name}/"
  filePath = dirName + fileName
  url = params[:url]

  # write image adata
  # open(filePath, 'wb') do |output|
  #   open(url) do |data|
  #     output.write(data.read)
  #   end
  # end
  # open(filePath,'wb') do |file|
  #   open(url) do |data|
  #     file.write(data.read)
  #   end
  # end
  begin
    open(filePath, 'wb') do |output|
      open(url) do |data|
        output.write(data.read)
      end
    end
    puts "success"
  rescue
    puts "fail"
  end

end


