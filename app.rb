#main.rb
require "sinatra"
require 'sinatra/reloader'
# require 'sinatra/cross_origin'
require 'fileutils'
require 'base64'
require 'open-uri'
require 'find'
# require 'zip/zip'
require 'kconv'
# require 'net/http'
require 'open-uri'
require 'zipruby'
# require 'zip'
# require 'RMagick'

# configure do
#   enable :cross_origin
# end

get '/' do
  # cross_origin
  erb :index
end

get '/downloads' do
  FileUtils.mkdir_p("zip") unless FileTest.exist?("zip")
  # #ここですべて圧縮する。
  # Dir::foreach("data") do |d|
  #   # next if d == "." or d == ".." or d == ".DS_Store"
  #   # next if File::ftype(d) != "directory"
  #   #   puts d
  #   if d != '.' && d!= '..' && d!= '.DS_Store'
  #     zip(d, "zip/"+ d + ".zip", :fs_encoding => "Shift_JIS")
  #   end
  # end

  Dir::foreach("data") do |d|
  #   # next if d == "." or d == ".." or d == ".DS_Store"
  #   # next if File::ftype(d) != "directory"
  #   #   puts d
    folder = "zip"
    if d != '.' && d!= '..' && d!= '.DS_Store'
      zipfile = d + ".zip"
      # files = ["data/"+d]
      unless FileTest.exist?("zip/"+zipfile)
        Zip::Archive.open("zip/"+zipfile, Zip::CREATE) do |arc|
          Dir::foreach("data/"+d) do |f|
            begin
              if f != '.' && f!= '..' && f!= '.DS_Store'
                # p f
                arc.add_file(f)
              end
            rescue
              puts "fail"
            end
          end
        end
      end
    end

  end


  @zips = Array.new
  Dir::foreach('zip') {|f|
    if f != '.' && f!= '..' && f!= '.DS_Store'
      @zips.push f
    end
    # if File::ftype(f) == "directory"
    #   puts "#{f} is directory"
    # end
  }
  p @zips
  # @directories = "aaa"
  erb :downloads
end

get '/download/:name' do
  # filename = "data/"+params[:name]
  # filename = "data/test1.zip"
  # open(filename, 'wb'){|file|
  #   OpenURI.open_uri(url, {:proxy=>nil}){|data|  #プロクシは使わない
  #     puts "\t"+data.content_type #ダウンロードするファイルのタイプを表示
  #     file.write(data.read) #ファイル名で保存
  #   }
  # }
  # open(filename, "r"){|io|
  #   while line=io.gets  #line = filepath(url)
  #     line.chomp!
  #     print line
  #     save_file(line.chomp)
  #   end
  # }
  File.chmod(0777,'zip/'+params[:name])
  send_file 'zip/'+params[:name]

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

# def zip(src, dest, options = {})
#   File.unlink(dest) if File.exist?(dest)
#   Zip::ZipFile.open(dest, Zip::ZipFile::CREATE) do |zf|
#     make_zip(zf, src, options)
#   end
# end

# def make_zip(zf, src, options)
#   if File.file?(src)
#     zf.add(src, src)
#     return
#   elsif File.directory?(src)
#     zf.mkdir(src)
#     Dir.foreach(src) do |f|
#       next if f == "." or f == ".."
#       make_zip(zf, src + '/' + f, options)
#     end
#     return
#   end
# end

def save_file(url)
  filename = File.basename(url)
  open(filename, 'wb'){|file|
    OpenURI.open_uri(url, {:proxy=>nil}){|data|  #ƒvƒƒNƒV‚ÍŽg‚í‚È‚¢ #use proxy {:proxy=>'address : port'}
      puts "\t"+data.content_type #ƒ_ƒEƒ“ƒ[ƒh‚·‚éƒtƒ@ƒCƒ‹‚Ìƒ^ƒCƒv‚ð•\Ž¦
      file.write(data.read) #ƒtƒ@ƒCƒ‹–¼‚Å•Û‘¶
    }
  }
end


