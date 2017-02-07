var _user$project$Native_Pixi = function() {

  var sceneList = {} // TODO put this in the cache

  function listEach(fn, list) {
    while (list.ctor !== '[]') {
      fn(list._0)
      list = list._1
    }
  }

  // each renderer is unique
  function updateOrCreateScene(name, w, h) {
    var scene = sceneList[name]

    if (!scene || !scene.renderer || scene.w != w || scene.h != h) {
      var renderer = PIXI.autoDetectRenderer(w, h, { antialias: true })
      var stage = new PIXI.Container()

      //stage.interactive = true
      scene = {
          renderer: renderer
        , stage: stage
        , w: w
        , h: h
      }
    }

    sceneList[name] = scene

    return scene
  }

  function destroyScene(scene) {
    if (scene.renderer) {
      scene.renderer.destroy()
    }
    if (scene.stage) {
      scene.stage.destroy()
    }
  }

  // if there is a particle with a matching textureName in the cache
  // then take it, otherwise create a new particle.  In both cases put
  // the new particle onto the new cache
  function updateOrCreateParticle(container, particleElm, oldCache, newCache) {
    var textureName = particleElm.texture
    var particle

    if (oldCache.particleList && oldCache.particleList[textureName]) {
      particle = oldCache.particleList[textureName].shift() // get the first added
    }

    if (!particle) {
      particle = PIXI.Sprite.from(textureName)
    }

    if (!newCache.particleList) {
        newCache.particleList = {}
    }
    if (!newCache.particleList[textureName]) {
      newCache.particleList[textureName] = []
    }

    newCache.particleList[textureName].push(particle)

    particle.position.set(particleElm.position._0, particleElm.position._1)
    particle.scale.set(particleElm.scale._0, particleElm.scale._1)
    particle.rotation = particleElm.rotation
    particle.alpha = particleElm.alpha
    particle.anchor.set(particleElm.anchor._0, particleElm.anchor._1)

    if (particle.parent != container) {
      container.addChild(particle) // do we need to removeChild?
    }

    return particle
  }

  // delete any particles that we no longer use
  function cleanupParticleCache(container, oldCache) {
    for (var textureName in oldCache.particleList) {
      var particleList = oldCache.particleList[textureName]

      for (var i = 0; i < particleList.length; ++i) {
        var particle = particleList[i]
        if (particle) { // should always be true
          container.removeChild(particle)
          particle.destroy({children: true})
        }
      }
    }
    oldCache.particleList = {}
  }

  function updateOrCreateContainer(parentContainer, containerElm, oldCache, newCache) {
    var containerName = containerElm.name
    var container

    var oldContainerCache = {}
    if (oldCache.containerList) {
      oldContainerCache = oldCache.containerList[containerName]
      if (oldContainerCache) {
        container = oldContainerCache.container
      }
    }

    if (!container) {
      var options = {
          position: containerElm.info.usePosition
        , scale: containerElm.info.useScale
        , rotation: containerElm.info.useRotation
        , uvs: containerElm.info.useUVs
        , alpha: containerElm.info.useAlpha
      }
      container = new PIXI.particles.ParticleContainer(containerElm.n, options)
    }

    if (!newCache.containerList) {
      newCache.containerList = {}
    }
    var newContainerCache = {container: container}
    newCache.containerList[containerName] = newContainerCache

    listEach(info => updateOrCreateParticle(container, info, oldContainerCache, newContainerCache), containerElm.particleList)
    cleanupParticleCache(container, oldContainerCache)

    if (container.parent != parentContainer) {
      parentContainer.addChild(container)
    }
  }

  function cleanupContainer(parentContainer, oldCache) {
      // #TODO
  }

  function toHtml(name, w, h, containerList, factList) {
    var scene = updateOrCreateScene(name, w, h)

    var model = {
        renderer: scene.renderer
      , w: w
      , h: h
      , stage: scene.stage
      , containerList: containerList
      , cache: {}
    }

    return _elm_lang$virtual_dom$Native_VirtualDom.custom(factList, model, implementation)
  }

  var implementation = {
      render: draw
    , diff: diff
  }

  function draw(model) {
    return drawPatch(model.renderer.view, {model: model})
  }

  function diff(oldData, newData) {
    // use the cache from the last pass
    newData.model.cache = oldData.model.cache

    return {
        applyPatch: drawPatch
      , data: newData
    }
  }

  // we will re-process the entire container
  function drawPatch(domNode, data) {
    var newCache = {}
    var model = data.model

    listEach(info => updateOrCreateContainer(model.stage, info._0, model.cache, newCache), model.containerList)

    // draw the root stage for this renderer
    //model.renderer.clear("black")
    model.renderer.render(model.stage)

    // the new cache represents the cache for the next frame
    data.model.cache = newCache
    return domNode
  }

  return {
      toHtml: F5(toHtml)
    , test: "Native Pixi"
  }

}();
