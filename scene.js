// Loss landscape visualization
// Wireframe surface representing a neural network loss function

(function() {
    const canvas = document.getElementById('loss-landscape');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Grid parameters - reduce for mobile performance
    const isMobile = window.innerWidth < 600;
    const gridSize = isMobile ? 25 : 40;
    const scale = isMobile ? 12 : 15;
    let time = 0;

    // Loss function - creates interesting surface with local minima
    function lossFunction(x, y, t) {
        const nx = x * 0.15;
        const ny = y * 0.15;

        // Multiple gaussian-like minima + saddle points
        const z = Math.sin(nx + t * 0.3) * Math.cos(ny + t * 0.2) * 2
                + Math.sin(nx * 2 - t * 0.1) * 0.5
                + Math.cos(ny * 1.5 + t * 0.15) * 0.7
                + Math.sin((nx + ny) * 0.8) * 0.8;

        return z;
    }

    // 3D rotation
    function rotateY(x, z, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos - z * sin,
            z: x * sin + z * cos
        };
    }

    function rotateX(y, z, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            y: y * cos - z * sin,
            z: y * sin + z * cos
        };
    }

    // Project 3D to 2D
    function project(x, y, z) {
        const perspective = 400;
        const scale3d = perspective / (perspective + z);
        return {
            x: width / 2 + x * scale3d * scale,
            y: height / 2 + y * scale3d * scale,
            scale: scale3d
        };
    }

    // Mouse/touch tracking for subtle interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / width - 0.5) * 0.3;
        mouseY = (e.clientY / height - 0.5) * 0.3;
    });
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = (e.touches[0].clientX / width - 0.5) * 0.3;
            mouseY = (e.touches[0].clientY / height - 0.5) * 0.3;
        }
    }, { passive: true });

    function draw() {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        time += 0.008;

        const rotY = time * 0.15 + mouseX;
        const rotX = 0.6 + mouseY;

        const points = [];
        const halfGrid = gridSize / 2;

        // Generate grid points
        for (let i = 0; i <= gridSize; i++) {
            points[i] = [];
            for (let j = 0; j <= gridSize; j++) {
                const x = (i - halfGrid) * 1.2;
                const z = (j - halfGrid) * 1.2;
                const y = lossFunction(x, z, time);

                // Apply rotations
                let rotated = rotateY(x, z, rotY);
                let final = rotateX(y, rotated.z, rotX);

                points[i][j] = project(rotated.x, final.y, final.z);
                points[i][j].depth = final.z;
            }
        }

        // Draw grid lines
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;

        // Draw from back to front for proper depth
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const p1 = points[i][j];
                const p2 = points[i + 1][j];
                const p3 = points[i][j + 1];

                // Depth-based opacity
                const avgDepth = (p1.depth + p2.depth) / 2;
                const alpha = Math.max(0.05, Math.min(0.4, 0.25 - avgDepth * 0.01));

                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;

                // Horizontal lines
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();

                // Vertical lines
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.stroke();
            }
        }

        // Draw a "gradient descent" particle
        const particleX = Math.sin(time * 0.5) * 8;
        const particleZ = Math.cos(time * 0.7) * 8;
        const particleY = lossFunction(particleX, particleZ, time) - 0.3;

        let pRotated = rotateY(particleX, particleZ, rotY);
        let pFinal = rotateX(particleY, pRotated.z, rotX);
        let pProjected = project(pRotated.x, pFinal.y, pFinal.z);

        // Particle glow
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(pProjected.x, pProjected.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Particle trail
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let t = 0; t < 20; t++) {
            const trailTime = time - t * 0.02;
            const tx = Math.sin(trailTime * 0.5) * 8;
            const tz = Math.cos(trailTime * 0.7) * 8;
            const ty = lossFunction(tx, tz, trailTime) - 0.3;

            let tRotated = rotateY(tx, tz, rotY);
            let tFinal = rotateX(ty, tRotated.z, rotX);
            let tProjected = project(tRotated.x, tFinal.y, tFinal.z);

            ctx.globalAlpha = (20 - t) / 40;
            ctx.beginPath();
            ctx.arc(tProjected.x, tProjected.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        requestAnimationFrame(draw);
    }

    draw();
})();
