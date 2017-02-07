import AnimationFrame
import Html exposing (Html)
import Pixi exposing (Pixi)
import Random
import Time exposing (Time)

main = Html.program {init = init, view = view, update = update, subscriptions = subscriptions}

init : (Model, Cmd Msg)
init =
  (initModel (Random.initialSeed 283741), Cmd.none)

subscriptions : Model -> Sub Msg
subscriptions model =
  AnimationFrame.times TimeMsg

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    TimeMsg t -> (updateModel t model, Cmd.none)

view : Model -> Html Msg
view model =
  Html.div []
    [ Pixi.toHtml "" width height
      [ Pixi.particleContainer "dudes" 10000 Pixi.defaultParticleContainerInfo
        (List.map viewDude model.dudeList)
      ] []
    ]


type alias Model = { t: Float, dudeList: List Dude }
type alias Dude = { x: Float, y: Float, direction: Float, turningSpeed: Float, speed: Float, offset: Float, scaley: Float, rotation: Float }

type Msg = TimeMsg Time

totalSprites = 500 -- Elm adds too much overhead for large numbers
width = 800
height = 600
padding = 20
dudeImage = "/images/tinyMaggot.png" -- borrowed from pixijs.com


initModel : Random.Seed -> Model
initModel seed =
  let
    createDude n seed list =
      let
        (x, seed2) = Random.step (Random.float 0 width) seed
        (y, seed3) = Random.step (Random.float 0 height) seed2
        (direction, seed4) = Random.step (Random.float 0 (pi*2)) seed3
        (turningSpeed, seed5) = Random.step (Random.float -0.8 0.2) seed4
        (speed, seed6) = Random.step (Random.float 0.1 0.8) seed5
        (offset, seed7) = Random.step (Random.float 0 100) seed6
        scaley = 1
        rotation = 0
      in
        if n == 0 then
          list
        else
          createDude (n - 1) seed7 <| (Dude x y direction turningSpeed speed offset scaley rotation) :: list
  in
    Model 0 (createDude totalSprites seed [])


updateModel : Time -> Model -> Model
updateModel t model =
  let
    nt = model.t + 0.1
  in
    { model | t = nt, dudeList = List.map (\dude -> updateDude nt dude) model.dudeList }

updateDude : Float -> Dude -> Dude
updateDude t dude =
  let
    nscaley = 0.95 + (sin(t + dude.offset)*0.05)
    ndirection = dude.direction + (dude.turningSpeed*0.01)
    nx = dude.x + (sin(ndirection)*dude.speed*nscaley)
    ny = dude.y + (cos(ndirection)*dude.speed*nscaley)
    nrotation = (-ndirection) + pi

    nx2 =
      if nx < -padding then
        nx + width
      else if nx > (width + padding*2) then
        nx - width
      else
        nx

    ny2 =
      if ny < -padding then
        ny + width
      else if ny > (width + padding*2) then
        ny - width
      else
        ny
  in
    { dude | x = nx
           , y = ny
           , direction = ndirection
           , rotation = nrotation
           , scaley = nscaley }


viewDude : Dude -> Pixi.Particle
viewDude dude =
  Pixi.particle dudeImage (dude.x, dude.y) (0.5, 0.5) (1, dude.scaley) dude.rotation 1
