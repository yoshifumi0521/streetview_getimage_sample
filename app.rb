#main.rb
require "sinatra"
require 'sinatra/reloader'

get '/' do
    erb :index
end

#フォルダを作成する。
# post '/start/from/:start_point/to/:end_point' do
#   # FileUtils.rm_rf('data')
# end

post '/start' do
  # FileUtils.rm_rf('data')
end


