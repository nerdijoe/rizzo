# Protect legacy apps that already define jquery downloading it again
if !!window.jQuery then define('jquery', [], -> window.jQuery )

require ['jquery', 'lib/core/base', 'flamsteed'], ($, Base) ->
  $ ->
    base = new Base()

