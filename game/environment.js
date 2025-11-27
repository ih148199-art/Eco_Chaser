// ============================================================
// 배경 환경 요소 함수들 (Environment Elements)
// ============================================================
// 이 파일에는 게임 배경을 구성하는 모든 3D 오브젝트 생성 함수가 포함되어 있습니다.
// main.js에서 state 객체와 THREE를 사용합니다.
// ============================================================

// 배경 환경 생성 (나무, 건물, 구름 등)
function createEnvironment() {
    // 트랙 끝 기준으로 배경 길이 설정 (쓰레기통이 끝나는 지점 근처까지만)
    const baseLength = state.trackEndZ && state.trackEndZ > 0 ? state.trackEndZ + 80 : state.roadLength * 5;
    const envLength = baseLength;
    // 잔디 바닥 (도로 양옆)
    const grassGeo = new THREE.PlaneGeometry(30, envLength);
    const grassMat = new THREE.MeshStandardMaterial({
        color: 0x4a8c2a, // 진한 초록색 잔디
        roughness: 0.9,
        side: THREE.DoubleSide,
    });
    
    // 왼쪽 잔디
    const grassLeft = new THREE.Mesh(grassGeo, grassMat);
    grassLeft.rotation.x = -Math.PI / 2;
    grassLeft.position.set(-23, -0.01, envLength / 2);
    state.scene.add(grassLeft);
    
    // 오른쪽 잔디
    const grassRight = new THREE.Mesh(grassGeo, grassMat);
    grassRight.rotation.x = -Math.PI / 2;
    grassRight.position.set(23, -0.01, envLength / 2);
    state.scene.add(grassRight);
    
    // 나무 생성 (개수 증가: 25 → 50개, 배치 개선)
    for (let i = 0; i < 50; i++) {
        const z = Math.random() * envLength - 20;
        const side = Math.random() > 0.5 ? 1 : -1;
        // 도로(레인 -4, 0, 4)를 피하고 잔디 영역에만 배치
        // 도로 폭은 약 16 (레인 -8 ~ 8), 안전하게 x는 ±10 이상에 배치
        const x = side * (10 + Math.random() * 12);
        createTree(x, z);
    }
    
    // 건물 생성 (개수 증가: 6 → 10개)
    for (let i = 0; i < 10; i++) {
        const z = (i / 9) * envLength - 20;
        const side = Math.random() > 0.5 ? 1 : -1;
        const x = side * (18 + Math.random() * 8);
        const height = 8 + Math.random() * 12;
        createBuilding(x, z, height);
    }
    
    // 구름 생성 (개수 증가: 8 → 15개)
    for (let i = 0; i < 15; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = 25 + Math.random() * 15;
        const z = Math.random() * envLength;
        createCloud(x, y, z);
    }
    
    // 도로 표지판 (개수 증가: 3 → 6개)
    for (let i = 0; i < 6; i++) {
        const z = i * (envLength / 6);
        createRoadSign(-9, z);
        createRoadSign(9, z + 25);
    }
    
    // 분리수거 테마 요소들 추가
    
    // 재활용 마크 조형물 (랜덤 배치)
    for (let i = 0; i < 4; i++) {
        const z = Math.random() * envLength * 0.8 + 20;
        const side = Math.random() > 0.5 ? 1 : -1;
        const x = side * (12 + Math.random() * 3);
        createRecycleSymbol(x, z);
    }
    
    // 가로등 (양쪽에 일렬로 균등 배치)
    const streetLightInterval = 35;
    for (let i = 0; i < Math.ceil(envLength / streetLightInterval); i++) {
        const z = i * streetLightInterval;
        createSolarStreetLight(-11, z);
        createSolarStreetLight(11, z);
    }

    // 공원 벤치 & 쓰레기통 세트 (랜덤 배치)
    const benchCount = Math.ceil(envLength / 60);
    for (let i = 0; i < benchCount; i++) {
        const z = Math.random() * envLength + 10;
        const side = Math.random() > 0.5 ? 1 : -1;
        const x = side * (11 + Math.random() * 2);
        createParkBenchSet(x, z);
    }

    // 재활용 센터 미니 건물 (1개만)
    createRecycleCenter(25, envLength * 0.5);
    
    // 환경 보호 광고판 (6 → 3개로 감소)
    for (let i = 0; i < 3; i++) {
        const z = i * (envLength / 3) + 40;
        const side = i % 2 === 0 ? 1 : -1;
        createEcoBillboard(side * 15, z);
    }
    
    // 풍력 발전기 (멀리, 도로와 충분히 떨어진 위치에 배치)
    // 도로 레인(-4, 0, 4)에서 한참 벗어나도록 x 좌표를 크게 잡음
    createWindTurbine(-40, envLength * 0.5);
    createWindTurbine(40, envLength * 0.6);
    
    // 화단 (도로변 꽃)
    for (let i = 0; i < Math.ceil(envLength / 25); i++) {
        const z = i * 25;
        const side = Math.random() > 0.5 ? 1 : -1;
        createFlowerBed(side * 9.5, z);
    }

    // 도로 끝을 막는 건물 배리어는 사용하지 않음 (도로를 열린 형태로 유지)
}

// 나무 생성
function createTree(x, z) {
    const tree = new THREE.Group();
    
    // 랜덤으로 다양한 스타일의 나무 생성 (5가지 스타일)
    const treeStyle = Math.random();
    
    if (treeStyle < 0.2) {
        // 스타일 1: 둥근 나무 (밝은 초록)
        const trunkGeo = new THREE.CylinderGeometry(0.25, 0.3, 2.5, 12);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0xa0826d,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        tree.add(trunk);
        
        const foliageGeo1 = new THREE.SphereGeometry(1.8, 16, 16);
        const foliageMat1 = new THREE.MeshStandardMaterial({ 
            color: 0x7cb342,
            roughness: 0.8
        });
        const foliage1 = new THREE.Mesh(foliageGeo1, foliageMat1);
        foliage1.position.y = 3.5;
        foliage1.scale.set(1, 0.9, 1);
        foliage1.castShadow = true;
        tree.add(foliage1);
        
        const foliageGeo2 = new THREE.SphereGeometry(1.2, 16, 16);
        const foliageMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x9ccc65,
            roughness: 0.8
        });
        const foliage2 = new THREE.Mesh(foliageGeo2, foliageMat2);
        foliage2.position.set(0.8, 3.8, 0.5);
        foliage2.castShadow = true;
        tree.add(foliage2);
        
    } else if (treeStyle < 0.4) {
        // 스타일 2: 노란-초록 혼합 나무
        const trunkGeo = new THREE.CylinderGeometry(0.28, 0.35, 2.8, 12);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x8b6f47,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.4;
        trunk.castShadow = true;
        tree.add(trunk);
        
        const foliageGeo1 = new THREE.SphereGeometry(1.5, 16, 16);
        const foliageMat1 = new THREE.MeshStandardMaterial({ 
            color: 0xffd54f,
            roughness: 0.8
        });
        const foliage1 = new THREE.Mesh(foliageGeo1, foliageMat1);
        foliage1.position.y = 3.3;
        foliage1.castShadow = true;
        tree.add(foliage1);
        
        const foliageGeo2 = new THREE.SphereGeometry(1.3, 16, 16);
        const foliageMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x9ccc65,
            roughness: 0.8
        });
        const foliage2 = new THREE.Mesh(foliageGeo2, foliageMat2);
        foliage2.position.set(-0.7, 3.5, -0.5);
        foliage2.castShadow = true;
        tree.add(foliage2);
        
    } else if (treeStyle < 0.6) {
        // 스타일 3: 작은 관목형 나무
        const bushGeo1 = new THREE.SphereGeometry(1.2, 16, 16);
        const bushMat1 = new THREE.MeshStandardMaterial({ 
            color: 0x66bb6a,
            roughness: 0.85
        });
        const bush1 = new THREE.Mesh(bushGeo1, bushMat1);
        bush1.position.y = 1.2;
        bush1.scale.set(1, 0.8, 1);
        bush1.castShadow = true;
        tree.add(bush1);
        
        const bushGeo2 = new THREE.SphereGeometry(0.9, 16, 16);
        const bushMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x81c784,
            roughness: 0.85
        });
        const bush2 = new THREE.Mesh(bushGeo2, bushMat2);
        bush2.position.set(0.6, 1.0, 0.3);
        bush2.castShadow = true;
        tree.add(bush2);
        
    } else if (treeStyle < 0.8) {
        // 스타일 4: 원뿔형 소나무
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 12);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x6d4c41,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // 원뿔형 나뭇잎 (3단 구조)
        const coneGeo1 = new THREE.ConeGeometry(1.5, 2.5, 12);
        const coneMat = new THREE.MeshStandardMaterial({ 
            color: 0x2e7d32,
            roughness: 0.85
        });
        const cone1 = new THREE.Mesh(coneGeo1, coneMat);
        cone1.position.y = 2.5;
        cone1.castShadow = true;
        tree.add(cone1);
        
        const coneGeo2 = new THREE.ConeGeometry(1.2, 2, 12);
        const cone2 = new THREE.Mesh(coneGeo2, coneMat);
        cone2.position.y = 3.5;
        cone2.castShadow = true;
        tree.add(cone2);
        
        const coneGeo3 = new THREE.ConeGeometry(0.8, 1.5, 12);
        const cone3 = new THREE.Mesh(coneGeo3, coneMat);
        cone3.position.y = 4.5;
        cone3.castShadow = true;
        tree.add(cone3);
        
    } else {
        // 스타일 5: 타원형 나무 (진한 초록)
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.35, 3, 12);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x795548,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // 타원형 나뭇잎
        const foliageGeo = new THREE.SphereGeometry(1.6, 16, 16);
        const foliageMat = new THREE.MeshStandardMaterial({ 
            color: 0x558b2f,
            roughness: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 3.8;
        foliage.scale.set(1.2, 1.5, 1.2);
        foliage.castShadow = true;
        tree.add(foliage);
        
        // 추가 작은 구 (풍성함)
        const foliageGeo2 = new THREE.SphereGeometry(1, 16, 16);
        const foliageMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x689f38,
            roughness: 0.8
        });
        const foliage2 = new THREE.Mesh(foliageGeo2, foliageMat2);
        foliage2.position.set(-0.9, 3.2, 0.6);
        foliage2.castShadow = true;
        tree.add(foliage2);
    }
    
    tree.position.set(x, 0, z);
    state.scene.add(tree);
    state.environmentObjects.push(tree);
}

// 건물 생성
function createBuilding(x, z, height) {
    const building = new THREE.Group();
    
    // 다양한 건물 색상 배열 (환경 친화적인 파스텔톤)
    const buildingColors = [
        0xe8f5e9, // 연한 초록
        0xe3f2fd, // 연한 파랑
        0xfff3e0, // 연한 주황
        0xf3e5f5, // 연한 보라
        0xfce4ec, // 연한 핑크
        0xe0f2f1, // 연한 청록
    ];
    
    const buildingColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
    
    // 메인 건물
    const buildingGeo = new THREE.BoxGeometry(4, height, 4);
    const buildingMat = new THREE.MeshStandardMaterial({
        color: buildingColor,
        roughness: 0.7,
        metalness: 0.1,
    });
    const buildingMesh = new THREE.Mesh(buildingGeo, buildingMat);
    buildingMesh.position.y = height / 2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    building.add(buildingMesh);
    
    // 옥상 테두리
    const roofEdgeGeo = new THREE.BoxGeometry(4.2, 0.3, 4.2);
    const roofEdgeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(buildingColor).multiplyScalar(0.7),
    });
    const roofEdge = new THREE.Mesh(roofEdgeGeo, roofEdgeMat);
    roofEdge.position.y = height;
    building.add(roofEdge);
    
    // 입구 (1층 중앙)
    const entranceGeo = new THREE.BoxGeometry(1.2, 2, 0.1);
    const entranceMat = new THREE.MeshStandardMaterial({
        color: 0x795548, // 갈색 문
        roughness: 0.8,
    });
    const entrance = new THREE.Mesh(entranceGeo, entranceMat);
    entrance.position.set(0, 1, 2.05);
    building.add(entrance);
    
    // 창문들
    const windowGeo = new THREE.BoxGeometry(0.6, 0.8, 0.15);
    const windowColors = [
        { base: 0x64b5f6, emissive: 0x1976d2 }, // 파랑
        { base: 0x81c784, emissive: 0x388e3c }, // 초록
        { base: 0xffb74d, emissive: 0xf57c00 }, // 주황
    ];
    const windowColor = windowColors[Math.floor(Math.random() * windowColors.length)];
    
    const windowMat = new THREE.MeshStandardMaterial({
        color: windowColor.base,
        emissive: windowColor.emissive,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.5,
    });
    
    const floors = Math.floor(height / 2);
    // 앞면 창문
    for (let f = 1; f < floors; f++) { // 1층은 입구가 있으므로 제외
        for (let w = 0; w < 3; w++) {
            if (f === 1 && w === 1) continue; // 입구 위치 피하기
            
            const window1 = new THREE.Mesh(windowGeo, windowMat);
            window1.position.set(
                (w - 1) * 1.2,
                f * 2 + 1,
                2.05
            );
            building.add(window1);
            
            // 창틀
            const frameGeo = new THREE.BoxGeometry(0.7, 0.9, 0.1);
            const frameMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
            });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.set(
                (w - 1) * 1.2,
                f * 2 + 1,
                2.0
            );
            building.add(frame);
        }
    }
    
    // 옆면 창문 (간단히)
    for (let f = 1; f < floors; f++) {
        const sideWindow1 = new THREE.Mesh(windowGeo, windowMat);
        sideWindow1.position.set(2.05, f * 2 + 1, 0);
        sideWindow1.rotation.y = Math.PI / 2;
        building.add(sideWindow1);
        
        const sideWindow2 = new THREE.Mesh(windowGeo, windowMat);
        sideWindow2.position.set(-2.05, f * 2 + 1, 0);
        sideWindow2.rotation.y = Math.PI / 2;
        building.add(sideWindow2);
    }
    
    // 에어컨 실외기 (랜덤 배치)
    if (Math.random() > 0.5) {
        const acGeo = new THREE.BoxGeometry(0.3, 0.2, 0.4);
        const acMat = new THREE.MeshStandardMaterial({ color: 0xbdbdbd });
        const ac = new THREE.Mesh(acGeo, acMat);
        ac.position.set(1.5, height * 0.3, 2.2);
        building.add(ac);
    }
    
    // 옥상 안테나/위성접시
    if (Math.random() > 0.6) {
        const antennaGroup = new THREE.Group();
        
        // 안테나 기둥
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x424242 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 0.75;
        antennaGroup.add(pole);
        
        // 접시
        const dishGeo = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dishMat = new THREE.MeshStandardMaterial({ 
            color: 0xeeeeee,
            metalness: 0.8,
            roughness: 0.2,
        });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.position.y = 1.5;
        dish.rotation.x = Math.PI / 4;
        antennaGroup.add(dish);
        
        antennaGroup.position.set(
            (Math.random() - 0.5) * 1.5,
            height,
            (Math.random() - 0.5) * 1.5
        );
        building.add(antennaGroup);
    }
    
    // 발코니 (중간층에)
    const balconyFloor = Math.floor(floors / 2);
    if (floors > 3 && Math.random() > 0.4) {
        for (let w = 0; w < 3; w++) {
            const balconyGeo = new THREE.BoxGeometry(0.8, 0.05, 0.4);
            const balconyMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(buildingColor).multiplyScalar(0.8),
            });
            const balcony = new THREE.Mesh(balconyGeo, balconyMat);
            balcony.position.set(
                (w - 1) * 1.2,
                balconyFloor * 2 + 0.5,
                2.25
            );
            building.add(balcony);
            
            // 발코니 난간
            const railingGeo = new THREE.BoxGeometry(0.8, 0.3, 0.02);
            const railingMat = new THREE.MeshStandardMaterial({ color: 0x757575 });
            const railing = new THREE.Mesh(railingGeo, railingMat);
            railing.position.set(
                (w - 1) * 1.2,
                balconyFloor * 2 + 0.8,
                2.45
            );
            building.add(railing);
        }
    }
    
    // 건물 외벽 라인 장식 (수평선)
    for (let i = 1; i <= 3; i++) {
        const lineHeight = (height / 4) * i;
        const lineGeo = new THREE.BoxGeometry(4.1, 0.1, 4.1);
        const lineMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(buildingColor).multiplyScalar(0.85),
        });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.y = lineHeight;
        building.add(line);
    }
    
    // 간판 (일부 건물에만)
    if (Math.random() > 0.6) {
        const signGeo = new THREE.BoxGeometry(2, 0.5, 0.1);
        const signColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
        const signColor = signColors[Math.floor(Math.random() * signColors.length)];
        const signMat = new THREE.MeshStandardMaterial({
            color: signColor,
            emissive: signColor,
            emissiveIntensity: 0.5,
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, height * 0.2, 2.1);
        building.add(sign);
    }
    
    // 옥상 정원 (일부 건물에)
    if (Math.random() > 0.7) {
        // 나무 화분들
        for (let i = 0; i < 3; i++) {
            const potGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8);
            const potMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
            const pot = new THREE.Mesh(potGeo, potMat);
            pot.position.set(
                (Math.random() - 0.5) * 2,
                height + 0.1,
                (Math.random() - 0.5) * 2
            );
            building.add(pot);
            
            // 작은 나무
            const treeGeo = new THREE.ConeGeometry(0.2, 0.5, 6);
            const treeMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
            const tree = new THREE.Mesh(treeGeo, treeMat);
            tree.position.set(
                pot.position.x,
                height + 0.4,
                pot.position.z
            );
            building.add(tree);
        }
    }
    
    // 건물 코너 기둥 장식
    const pillarGeo = new THREE.BoxGeometry(0.15, height, 0.15);
    const pillarMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(buildingColor).multiplyScalar(0.6),
        roughness: 0.8,
    });
    
    const corners = [
        [1.93, 1.93],
        [-1.93, 1.93],
        [1.93, -1.93],
        [-1.93, -1.93]
    ];
    
    corners.forEach(([cx, cz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(cx, height / 2, cz);
        building.add(pillar);
    });
    
    building.position.set(x, 0, z);
    state.scene.add(building);
    state.environmentObjects.push(building);
}

// 구름 생성
function createCloud(x, y, z) {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
    });
    
    // 여러 구체로 구름 만들기
    for (let i = 0; i < 5; i++) {
        const sphereGeo = new THREE.SphereGeometry(1 + Math.random() * 0.5, 8, 8);
        const sphere = new THREE.Mesh(sphereGeo, cloudMat);
        sphere.position.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 2
        );
        cloud.add(sphere);
    }
    
    cloud.position.set(x, y, z);
    state.scene.add(cloud);
    state.environmentObjects.push(cloud);
}

// 재활용 마크 조형물
function createRecycleSymbol(x, z) {
    const group = new THREE.Group();
    
    // 받침대
    const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.3, 8);
    const baseMat = new THREE.MeshStandardMaterial({ 
        color: 0x757575,
        roughness: 0.7,
        metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);
    
    // 재활용 마크 (3개의 화살표를 원형으로)
    const arrowMat = new THREE.MeshStandardMaterial({
        color: 0x4caf50,
        emissive: 0x2e7d32,
        emissiveIntensity: 0.3,
    });
    
    for (let i = 0; i < 3; i++) {
        const arrow = new THREE.Group();
        
        // 화살표 몸통
        const bodyGeo = new THREE.BoxGeometry(0.15, 0.6, 0.1);
        const body = new THREE.Mesh(bodyGeo, arrowMat);
        body.position.y = 0.3;
        body.castShadow = true;
        arrow.add(body);
        
        // 화살표 머리
        const headGeo = new THREE.ConeGeometry(0.2, 0.3, 3);
        const head = new THREE.Mesh(headGeo, arrowMat);
        head.position.y = 0.75;
        head.rotation.z = Math.PI;
        head.castShadow = true;
        arrow.add(head);
        
        arrow.rotation.y = (i * Math.PI * 2) / 3;
        arrow.position.y = 1.5;
        arrow.rotation.x = Math.PI / 6;
        group.add(arrow);
    }
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}

// ============================================================
// 배경 환경 요소 섹션 끝
// ============================================================

// 점수 이펙트 표시 (+10 / -10)
function showScoreEffect(amount) {
    const el = document.getElementById('scoreEffect');
    if (!el) return;

    el.textContent = amount > 0 ? `+${amount}` : `${amount}`;

    el.classList.remove('negative');
    if (amount < 0) {
        el.classList.add('negative');
    }

    el.classList.remove('show');
    // 리플로우 강제해서 애니메이션 재적용
    void el.offsetWidth;
    el.classList.add('show');
}

// 현실적인 태양광 가로등
function createSolarStreetLight(x, z) {
    const group = new THREE.Group();
    
    // 기둥 베이스 (받침대)
    const baseGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 12);
    const baseMat = new THREE.MeshStandardMaterial({ 
        color: 0x424242,
        roughness: 0.8,
        metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);
    
    // 메인 기둥 (금속 질감)
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 4.5, 12);
    const poleMat = new THREE.MeshStandardMaterial({ 
        color: 0x546e7a,
        roughness: 0.4,
        metalness: 0.7
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 2.5;
    pole.castShadow = true;
    pole.receiveShadow = true;
    group.add(pole);
    
    // 기둥 상단 연결부
    const topConnectorGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 12);
    const topConnector = new THREE.Mesh(topConnectorGeo, poleMat);
    topConnector.position.y = 4.85;
    topConnector.castShadow = true;
    group.add(topConnector);
    
    // 태양광 패널 지지대
    const panelArmGeo = new THREE.BoxGeometry(0.08, 0.08, 0.5);
    const panelArm = new THREE.Mesh(panelArmGeo, poleMat);
    panelArm.position.set(0, 5.1, 0.25);
    panelArm.rotation.x = -Math.PI / 8;
    panelArm.castShadow = true;
    group.add(panelArm);
    
    // 태양광 패널 (더 현실적인 크기와 재질)
    const panelGeo = new THREE.BoxGeometry(0.7, 0.04, 0.5);
    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1a237e,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x0d47a1,
        emissiveIntensity: 0.1
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 5.3, 0.4);
    panel.rotation.x = -Math.PI / 5;
    panel.castShadow = true;
    panel.receiveShadow = true;
    group.add(panel);
    
    // 패널 프레임
    const frameGeo = new THREE.BoxGeometry(0.72, 0.06, 0.52);
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0x37474f,
        metalness: 0.8,
        roughness: 0.3
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 5.28, 0.4);
    frame.rotation.x = -Math.PI / 5;
    frame.castShadow = true;
    group.add(frame);
    
    // 조명 헤드 (램프 하우징)
    const lampHousingGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.4, 16);
    const lampHousingMat = new THREE.MeshStandardMaterial({
        color: 0x263238,
        roughness: 0.5,
        metalness: 0.6
    });
    const lampHousing = new THREE.Mesh(lampHousingGeo, lampHousingMat);
    lampHousing.position.y = 4.6;
    lampHousing.castShadow = true;
    group.add(lampHousing);
    
    // LED 조명 (발광)
    const lightGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.15, 16);
    const lightMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfff59d,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.1
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.y = 4.35;
    group.add(light);
    
    // 장식 링
    const ringGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffc107,
        metalness: 0.9,
        roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 4.85;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}

// 공원 벤치 & 쓰레기통 세트 (그림자 추가)
function createParkBenchSet(x, z) {
    const group = new THREE.Group();
    
    // 벤치
    const benchBackGeo = new THREE.BoxGeometry(1.5, 0.6, 0.1);
    const benchMat = new THREE.MeshStandardMaterial({ 
        color: 0x8d6e63,
        roughness: 0.8
    });
    const benchBack = new THREE.Mesh(benchBackGeo, benchMat);
    benchBack.position.set(0, 0.8, -0.3);
    benchBack.castShadow = true;
    benchBack.receiveShadow = true;
    group.add(benchBack);
    
    const benchSeatGeo = new THREE.BoxGeometry(1.5, 0.1, 0.5);
    const benchSeat = new THREE.Mesh(benchSeatGeo, benchMat);
    benchSeat.position.set(0, 0.5, -0.15);
    benchSeat.castShadow = true;
    benchSeat.receiveShadow = true;
    group.add(benchSeat);
    
    // 벤치 다리
    const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legPositions = [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.1], [0.6, 0.1]];
    legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, benchMat);
        leg.position.set(lx, 0.25, lz);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
    });
    
    // 작은 쓰레기통
    const binGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.5, 8);
    const binMat = new THREE.MeshStandardMaterial({ 
        color: 0x4caf50,
        roughness: 0.7
    });
    const bin = new THREE.Mesh(binGeo, binMat);
    bin.position.set(1.2, 0.25, 0);
    bin.castShadow = true;
    bin.receiveShadow = true;
    group.add(bin);
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}

// 재활용 센터 (그림자 추가)
function createRecycleCenter(x, z) {
    const group = new THREE.Group();
    
    // 건물
    const buildingGeo = new THREE.BoxGeometry(6, 4, 5);
    const buildingMat = new THREE.MeshStandardMaterial({
        color: 0xe8f5e9,
        roughness: 0.7,
    });
    const building = new THREE.Mesh(buildingGeo, buildingMat);
    building.position.y = 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);
    
    // 지붕
    const roofGeo = new THREE.ConeGeometry(4.5, 1.5, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    // 큰 재활용 마크
    const markGeo = new THREE.CircleGeometry(0.8, 32);
    const markMat = new THREE.MeshStandardMaterial({
        color: 0x4caf50,
        emissive: 0x2e7d32,
        emissiveIntensity: 0.5,
    });
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.position.set(0, 2.5, 2.51);
    group.add(mark);
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}

// 환경 보호 광고판 (그림자 추가)
function createEcoBillboard(x, z) {
    const group = new THREE.Group();
    
    // 지주 2개
    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ 
        color: 0x424242,
        roughness: 0.6,
        metalness: 0.4
    });
    
    const pole1 = new THREE.Mesh(poleGeo, poleMat);
    pole1.position.set(-1.5, 2.5, 0);
    pole1.castShadow = true;
    pole1.receiveShadow = true;
    group.add(pole1);
    
    const pole2 = new THREE.Mesh(poleGeo, poleMat);
    pole2.position.set(1.5, 2.5, 0);
    pole2.castShadow = true;
    pole2.receiveShadow = true;
    group.add(pole2);
    
    // 광고판
    const boardGeo = new THREE.BoxGeometry(3.5, 2, 0.1);
    const boardMat = new THREE.MeshStandardMaterial({
        color: 0x81c784,
        emissive: 0x66bb6a,
        emissiveIntensity: 0.3,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = 4;
    board.castShadow = true;
    board.receiveShadow = true;
    group.add(board);
    
    // "ECO" 텍스트 표현 (간단한 박스들로)
    const textMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
    });
    
    // E
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.05), textMat);
    e1.position.set(-0.8, 4, 0.1);
    group.add(e1);
    
    // C
    const c = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI * 1.5), textMat);
    c.position.set(0, 4, 0.1);
    c.rotation.y = Math.PI;
    group.add(c);
    
    // O
    const o = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16), textMat);
    o.position.set(0.8, 4, 0.1);
    group.add(o);
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}

// 풍력 발전기 (그림자 추가)
function createWindTurbine(x, z) {
    const group = new THREE.Group();
    
    // 타워
    const towerGeo = new THREE.CylinderGeometry(0.3, 0.5, 15, 8);
    const towerMat = new THREE.MeshStandardMaterial({ 
        color: 0xeeeeee,
        roughness: 0.5,
        metalness: 0.3
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 7.5;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);
    
    // 나셀 (본체)
    const nacelleGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
    const nacelleMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.5
    });
    const nacelle = new THREE.Mesh(nacelleGeo, nacelleMat);
    nacelle.rotation.z = Math.PI / 2;
    nacelle.position.set(0, 15, 0.5);
    nacelle.castShadow = true;
    group.add(nacelle);
    
    // 블레이드 3개
    const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        side: THREE.DoubleSide,
        roughness: 0.3,
        metalness: 0.2
    });
    
    for (let i = 0; i < 3; i++) {
        const bladeGeo = new THREE.BoxGeometry(0.1, 4, 0.5);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 2;
        blade.castShadow = true;
        
        const bladeArm = new THREE.Group();
        bladeArm.add(blade);
        bladeArm.rotation.z = (i * Math.PI * 2) / 3;
        bladeArm.position.set(0, 15, 1.5);
        group.add(bladeArm);
    }
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}

// 화단 (그림자 추가)
function createFlowerBed(x, z) {
    const group = new THREE.Group();
    
    // 화단 틀
    const bedGeo = new THREE.BoxGeometry(1.5, 0.3, 0.8);
    const bedMat = new THREE.MeshStandardMaterial({ 
        color: 0x795548,
        roughness: 0.9
    });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.15;
    bed.castShadow = true;
    bed.receiveShadow = true;
    group.add(bed);
    
    // 흙
    const soilGeo = new THREE.BoxGeometry(1.4, 0.1, 0.7);
    const soilMat = new THREE.MeshStandardMaterial({ 
        color: 0x5d4037,
        roughness: 1.0
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.35;
    soil.receiveShadow = true;
    group.add(soil);
    
    // 꽃들
    const flowerColors = [0xff1744, 0xff9100, 0xffea00, 0xe91e63, 0x9c27b0];
    for (let i = 0; i < 5; i++) {
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x33691e });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set((i - 2) * 0.25, 0.55, (Math.random() - 0.5) * 0.3);
        group.add(stem);
        
        const flowerGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const flowerMat = new THREE.MeshStandardMaterial({
            color: flowerColors[i % flowerColors.length],
            emissive: flowerColors[i % flowerColors.length],
            emissiveIntensity: 0.3,
        });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set((i - 2) * 0.25, 0.75, (Math.random() - 0.5) * 0.3);
        group.add(flower);
    }
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}

// 도로 표지판 생성
function createRoadSign(x, z) {
    const group = new THREE.Group();
    
    // 기둥
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.5;
    pole.castShadow = true;
    group.add(pole);
    
    // 표지판
    const signGeo = new THREE.BoxGeometry(1, 1, 0.1);
    const signMat = new THREE.MeshStandardMaterial({
        color: 0x32cd32, // 환경 테마에 맞게 초록색
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.y = 3.5;
    sign.castShadow = true;
    group.add(sign);
    
    group.position.set(x, 0, z);
    state.scene.add(group);
    state.environmentObjects.push(group);
}