/*
 * @Author: Talos--1660327787@qq.com
 * @Date: 2023-12-03 20:52:28
 * @LastEditors: Talos--1660327787@qq.com
 * @LastEditTime: 2023-12-07 23:39:38
 * @FilePath: /PoolGame-Web/Ball.js
 * @Description: 构造桌球Ball类，完成刚体属性和纹理设置，检测睡眠和碰撞落袋
 * 
 * Copyright (c) 2023 by five-forever, All Rights Reserved. 
 */

import * as THREE from './libs/three137/three.module.js';
import * as CANNON from './libs/cannon-es.js';

class Ball{
    static RADIUS = 0.05715 / 2;
    static MASS = 0.17;
    static MATERIAL = new CANNON.Material("ballMaterial");
    
    constructor(game, x, z, id=0) {
        this.id = id;
        this.startPosition = new THREE.Vector3(x, Ball.RADIUS, z);
        this.mesh = this.createMesh(game.scene);
        this.world = game.world;
        this.game = game;
        this.rigidBody = this.createBody(x, Ball.RADIUS, z);
        this.world.addBody(this.rigidBody);
        this.reset();
        this.name = `ball${id}`;
    }
    // 更新刚体属性的睡眠状态
    get isSleeping() {
      return this.rigidBody.sleepState == CANNON.Body.SLEEPING;
    }
    // 摆球复位
    reset() {
      this.rigidBody.velocity = new CANNON.Vec3(0);
      this.rigidBody.angularVelocity = new CANNON.Vec3(0);
      this.rigidBody.position.copy(this.startPosition);
      this.world.removeBody(this.rigidBody);
      this.world.addBody(this.rigidBody);
      this.mesh.position.copy(this.startPosition);
      this.mesh.rotation.set(0,0,0);
      this.mesh.visible = true;
      this.fallen = false;
    }
    // 球进洞更新状态
    onEnterHole() {
      this.rigidBody.velocity = new CANNON.Vec3(0);
      this.rigidBody.angularVelocity = new CANNON.Vec3(0);
      this.world.removeBody(this.rigidBody);
      this.fallen = true;
      this.mesh.visible = false;
      this.game.updateUI({event: 'balldrop', id: this.id});
    }
    // 创建刚体属性
    createBody(x,y,z) {
      const body = new CANNON.Body({
        mass: Ball.MASS, // kg
        position: new CANNON.Vec3(x,y,z), // m
        shape: new CANNON.Sphere(Ball.RADIUS),
        material: Ball.MATERIAL
      });

      body.linearDamping = 0.5; // 运动时每帧线性速度减缓50%
      body.angularDamping = 0.5; // 每帧角速度减缓 50%

      body.allowSleep = true;
      body.sleepSpeedLimit = 2; // 速度小于2考虑置为睡眠
      body.sleepTimeLimit = 0.1; // 不受外力后0.1s进入睡眠
    
      return body;
    }
    // 创建纹理
    createMesh (scene) {
        const geometry = new THREE.SphereGeometry(Ball.RADIUS, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            metalness: 0.0,
            roughness: 0.1,
            envMap: scene.environment
        });
  
        if (this.id>0){
            const textureLoader = new THREE.TextureLoader().setPath('./assets/pool-table/').load(`${this.id}ball.png`, tex => {
                material.map = tex;
                material.needsUpdate = true;
            });
        }
  
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    
        return mesh;
    };
 
    update(dt){
        if (this.fallen) return;

        this.mesh.position.copy(this.rigidBody.position);
        this.mesh.quaternion.copy(this.rigidBody.quaternion);
      
        // 判断进球
        if (this.rigidBody.position.y < -Ball.RADIUS && !this.fallen) {
          this.onEnterHole();
        }
    }
}

export { Ball };