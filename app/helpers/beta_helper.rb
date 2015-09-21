# BETA
module BetaHelper
  def place?
    presenter.is_a?(PlacePresenter) if defined?(presenter)
  end
  alias_method :is_place?, :place?

  def show_beta_banner
    return 1.0 if params[:beta] == 'destinations-next'

    rand < 0.0025
  end
end
