#main.rb
require "sinatra"
require 'sinatra/reloader'
# require 'sinatra/cross_origin'
require 'fileutils'
require 'base64'
require 'open-uri'
require 'find'
# require 'RMagick'

# configure do
#   enable :cross_origin
# end

get '/' do
  # cross_origin
  erb :index
end

get '/downloads' do
  # @directories = Array.new
  # Dir::foreach('data') {|f|
  #   if f != '.' && f!= '..' && f!= '.DS_Store'
  #     @directories.push f
  #   end
  #   # if File::ftype(f) == "directory"
  #   #   puts "#{f} is directory"
  #   # end
  # }
  # p @directories
  # @directories = "aaa"
  erb :downloads
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





