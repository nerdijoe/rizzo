# BETA
module BetaHelper
  # Look for a place presenter from Waldorf
  def place?
    presenter.is_a?(PlacePresenter) if defined?(presenter)
  end
  alias_method :is_place?, :place?

  # Show banner when ?beta=destinations-next is in the URL
  def show_beta_banner
    return 1.0 if params[:beta] == 'destinations-next'

    # Remove this line for production launch
    false

    # Uncomment this for production launch
    # prng = Random.new(Time.now.to_i)
    # prng.rand < 0.0025
  end
end
