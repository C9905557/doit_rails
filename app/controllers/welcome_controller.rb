class WelcomeController < ApplicationController

  def index
  end

  def doitproxy
    respond_to do |format|
      format.json { render_json }
    end
  end
  
  def render_json
    callback = params[:callback]
    host = "https://api.do-it.org"
    href = params[:href]
    url = host + href
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
    jsonp = "#{callback}(#{response.to_json})"
    render({content_type: "js", text: jsonp})    
  end
end
