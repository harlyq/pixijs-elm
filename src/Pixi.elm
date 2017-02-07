module Pixi exposing
  ( Pixi
  , Particle
  , ParticleContainerInfo
  , defaultParticleContainerInfo
  , particle
  , particleContainer
  , test
  , toHtml
  )

import Html exposing (Html)
import Native.Pixi

type Pixi = Pixi
type Renderer = Renderer
type Container = ParticleContainer { name: String, n: Int, info: ParticleContainerInfo, particleList: List Particle }

type alias Particle = { texture: String, position: (Float, Float), anchor: (Float, Float), scale: (Float, Float), rotation: Float, alpha: Float }
type alias ParticleContainerInfo = { useScale: Bool, usePosition: Bool, useRotation: Bool, useUVs: Bool, useAlpha: Bool }
type alias Vec2 = { x: Float, y: Float }

defaultParticleContainerInfo = ParticleContainerInfo True True True True True

test : String
test = Native.Pixi.test

toHtml : String -> Int -> Int -> List (Container) -> List (Html.Attribute msg) -> Html msg
toHtml name w h containerList factList = Native.Pixi.toHtml name w h containerList factList

particleContainer : String -> Int -> ParticleContainerInfo -> List Particle -> Container
particleContainer name n info particleList = ParticleContainer { name = name, n = n, info = info, particleList = particleList }

particle : String -> (Float, Float) -> (Float,Float) -> (Float, Float) -> Float -> Float -> Particle
particle texture position anchor scale rotation alpha = Particle texture position anchor scale rotation alpha
