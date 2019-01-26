require 'sinatra'
require 'rexml/document'
require 'hierx'
require 'str2'
#require 'str'

before do
  fname = ENV["TREEOP_INPUT_FILE_NAME"]
  @xml = Xmla.new( fname )
  @xml.make_root
  
  content_type :txt
  @defeat = {rock: :scissors, paper: :rock, scissors: :paper}
  @throws = @defeat.keys
end

get '/xml/c.json/' do
  headers "Content-Type" => "application/json"
  data = '[ { "text" : "Root node", "children" : [ "Child node 1", "Child node 2" ] } ]'
  #  data = '[{"id":2,"parent":1,"text":"node"},{"id":1,"parent":0,"text":"map"},{"id":0,"parent":null,"text":""}]'
=begin
  data = '[
       {"id":"5","parent":"4","text":"node[1]"},
       {"id":"4","parent":"3","text":"node"},
       {"id":"3","parent":"2","text":"node[1]"},
       {"id":"2","parent":"1","text":"node"},
       {"id":"1","parent":"0","text":"map"},
       {"id":"0","parent":"*","text":""}]'
  data = '[
       { "id" : "ajson1", "parent" : "#", "text" : "Simple root node" },
       { "id" : "ajson2", "parent" : "#", "text" : "Root node 2" },
       { "id" : "ajson3", "parent" : "ajson2", "text" : "Child 1" },
       { "id" : "ajson4", "parent" : "ajson2", "text" : "Child 2" }
    ]'
  data = '[
       {"id":"5","parent":"4","text":"node[1]"},
       {"id":"4","parent":"3","text":"node"},
       {"id":"3","parent":"2","text":"node[1]"},
       {"id":"2","parent":"1","text":"node"},
       {"id":"1","parent":"0","text":"map"},
       {"id":"0","parent":"#","text":"root"}
  ]'
=end
  data = '[
       {"id":5,"parent":4,"text":"node[1]"},
       {"id":4,"parent":3,"text":"node"},
       {"id":3,"parent":2,"text":"node[1]"},
       {"id":2,"parent":1,"text":"node"},
       {"id":1,"parent":0,"text":"map"},
       {"id":0,"parent":"#","text":"root"}
  ]'
  data
end

get '/xml/categories.json/2' do
  @xml.move( 2, 116 )
  data = @xml.get_categories_by_json
  headers "Content-Type" => "application/json"
  data
end

get '/xml/categories.json' do
  data = @xml.get_categories_by_json
  headers "Content-Type" => "application/json"
  data
end

get '/xml/bookmarks_count_json' do
  category_id = params[:category_id]
  callback_name = params[:callback]
  path = params[:path]
  headers "Content-Type" => "application/json"
  data = %Q![ { "count" : 1 } ]!
  data
end
get '/xml/bookmarks_count' do
  category_id = params[:category_id]
  callback_name = params[:callback]
  path = params[:path]
  headers "Content-Type" => "application/javascript"
  data = %Q!#{callback_name}([ { "count" : 1 } ])!
  data
end

get '/xml/bookmarks_json' do
  category_id = params[:category_id]
  path = params[:path]
  headers "Content-Type" => "application/json"
  data = %Q![ 
    { "id" : 1 , "name" : "northern-cross.info" , "title":"nci", "authors" : "清水川貴之" , "url" : "http://northern-cross.info"} ,
    { "id" : 2 , "name" : "northern-cross.net"  , "title":"ncn", "authors" : "小宮健" , "url" : "http://northern-cross.net"} 
  ]!
  %Q!#{data}!
end

get '/xml/bookmarks' do
  category_id = params[:category_id]
  callback_name = params[:callback]
  path = params[:path]
  headers "Content-Type" => "application/javascript"
  data = %Q![ 
    { "id" : 1 , "name" : "northern-cross.info" , "title":"nci", "authors" : "清水川貴之" , "url" : "http://northern-cross.info"} ,
    { "id" : 2 , "name" : "northern-cross.net"  , "title":"ncn", "authors" : "小宮健" , "url" : "http://northern-cross.net"} 
  ]!
  %Q!#{callback_name}( #{data} )!
end

get '/xml/add_bookmark' do
end

get '/xml/delete_bookmark' do
end

get '/xml/1' do
  "1"
end

get '/xml/2' do
  "OK2"
end

get '/xml' do
  erb :index
end

=begin
get '/xml/categories.json/:kind' do
  kind = params[:kind]
  if kind
    kind_num = kind.to_i
  else
    kind_num = 0
  end
  data = @xml.get_categories_by_json
  
  headers "Content-Type" => "application/json"
  data
end
=end
__END__
@@index
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>jsTree test</title>
    <link rel="stylesheet" type="text/css" href="jstree/dist/themes/default/style.min.css" />
    <script type="text/javascript" src="jquery-1.12.4.min.js"></script>
    <script type="text/javascript" src="jstree/dist/jstree.min.js"></script>
    <script type="text/javascript" src="jsondatax.js"></script>
    <script type="text/javascript" src="jst5.js"></script>

  </head>
  <body>
    <!--[if lte IE 9]><script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <div id="boxA">
      <div id="jstree"></div>
    </div>
    <button id="clear" value="clear">clear</button>
    <button id="btn2" value="2">2</button>
    <button id="btn3" value="3">3</button>
    <button id="btn4" value="4">4</button>
    <button id="btn5" value="5">5</button>
    <p></p>

  </body>
</html>

@@jsondata
    jsonDataX = <%= @jsonDataX %>

 </div>
    <button id="clear" value="clear">clear</button>
    <button id="btn2" value="2">2</button>
    <button id="btn3" value="3">3</button>
    <button id="btn4" value="4">4</button>
    <button id="btn5" value="5">5</button>
    <p></p>

  </body>
</html>

@@jsondata
    jsonDataX = <%= @jsonDataX %>

