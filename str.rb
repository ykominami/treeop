require 'hierx'
require 'rexml/document'
require 'json'

class Xmla
  def initialize( fname )
    @xml = File.read(fname)

    @doc = REXML::Document.new(@xml)

    @hierx = Hierx.init( "" )
  end
  
  def move( id , new_parent )
    @hierx.move( id , new_parent )
  end
  
  def make_root
    @doc.elements.each do |x|
      make_node( x )
    end
    @hierx.repair
  end

  def make_node( node )
    xpath = node.xpath
    xpath = "" unless xpath

    make_nodex_hier( xpath )
    
    node.elements.each do |x|
      make_node( x )
    end
  end

  def make_nodex_hier( xpath )
#    puts "xpath=#{xpath}"
    @hierx.add_by_path( xpath )
  end
  
  def get_categories_by_json
    JSON(
      @hierx.get_node_by_path_keys.sort.reverse.map{ |key|
        node = @hierx.get_node_by_path( key )
        if node
          id = node.id
          text = node.content
          parent_id = @hierx.get_node_parent_id_by_id( id )
          parent_id = "#" unless parent_id
        else
          id = ""
          text = ""
          parent_id = "#"
        end
        { "id" => id , "parent" => parent_id , "text" => text }
      } )
  end
  
end

def testx
  fname = "2016-items.mm"
  @xml = Xmla.new( fname )
  @xml.make_root

  data = @xml.get_categories_by_json
  my_array = JSON.parse( data )
  my_array.sort{|a,b| a["id"] <=> b["id"] }.each{|x|
    puts x
  }

  puts "---"

  @xml.move( 2, 116 )

  puts "===---"

  data = @xml.get_categories_by_json
  my_array = JSON.parse( data )
  my_array.sort{|a,b| a["id"] <=> b["id"] }.each{|x|
    puts x
  }

end

#testx

