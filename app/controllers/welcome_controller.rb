class WelcomeController < ApplicationController

  def index
  end

  def doitproxy
    respond_to do |format|
      format.json { render_json }
    end
  end
  
  def render_json
    #callback = params[:callback]
    # Which page to ask for
    page = params[:page]
    url = "https://api.do-it.org/v1/opportunities\?lat\=51.567526\&lng\=-0.182308\&miles\=2&page=#{page}" 
    puts "++++++render_json called, url: #{url}"
    begin
      response = HTTParty.get(url)
      # Check for HTTP errors
      unless response.code == 200 then
        head :internal_server_error and return
      end
    # Rescue other errors (timeout, bug,...)
    rescue
      # I leave that ststement repetition to smne zaelous dryer
      head :internal_server_error and return
    end
    resp_body = JSON.parse(response.body)
    markers_hash = get_markers_hash resp_body["data"]["items"]
    
    json = "{ #{get_meta_data( resp_body )}, " + 
               "\"markers\": #{markers_hash.to_json}}"
    render( {content_type: "js", text: json} )
  end
  
  def get_markers_hash respItems
    return Gmaps4rails.build_markers(respItems) do |item, marker|
              marker.lat item["lat"]
              marker.lng item["lng"]
              marker.title item["title"]
           end
  end
  
  def get_meta_data body
    items_per_page = body["meta"]["items_per_page"]
    total_items = body["meta"]["total_items"]
    total_pages = body["meta"]["total_pages"]
    current_page = body["meta"]["current_page"]
    next_page = current_page == total_pages ? 'null' : current_page + 1
    return "\"meta\": {\"next_page\": #{next_page}, " +
                  "\"current_page\": #{current_page}, " +
                  "\"items_per_page\": #{items_per_page}, " +
                  "\"total_items\": #{total_items}, " +
                  "\"total_pages\": #{total_pages}} "
  end

end
