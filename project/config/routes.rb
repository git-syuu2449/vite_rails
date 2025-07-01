Rails.application.routes.draw do
  
  root to: "samples#index"
  get "/samples", controller: "samples", action: :index
end
