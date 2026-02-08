/**
 * Minimap Renderer
 * Renders a 2D overhead view showing player position and landmarks
 */

export class Minimap {
    constructor(canvas, worldManager, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.worldManager = worldManager;

        this.size = options.size ?? 140;
        this.scale = options.scale ?? 1.8; // World units per pixel
        this.visible = true;

        this.canvas.width = this.size;
        this.canvas.height = this.size;

        // Colors
        this.colors = {
            background: "rgba(15, 39, 42, 0.85)",
            land: "#5a7a6e",
            water: "#3d6a8a",
            road: "#8a8a7a",
            player: "#f4e2bf",
            playerArrow: "#f4e2bf",
            landmark: "#e8c170",
            landmarkBorder: "#1f4c4e",
        };
    }

    setVisible(visible) {
        this.visible = visible;
        this.canvas.style.display = visible ? "" : "none";
    }

    update(playerPosition, playerRotationY) {
        if (!this.visible) return;

        const ctx = this.ctx;
        const centerX = this.size / 2;
        const centerY = this.size / 2;

        // Clear with background
        ctx.fillStyle = this.colors.background;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Clip to circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size / 2 - 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw terrain (simplified grid)
        const step = 8;

        for (let px = 0; px < this.size; px += step) {
            for (let py = 0; py < this.size; py += step) {
                const worldX = playerPosition.x + (px - centerX) * this.scale;
                const worldZ = playerPosition.z + (py - centerY) * this.scale;

                const isWater = this.isWaterAt(worldX, worldZ);
                const isRoadTile = this.isRoadAt(worldX, worldZ);

                if (isWater) {
                    ctx.fillStyle = this.colors.water;
                } else if (isRoadTile) {
                    ctx.fillStyle = this.colors.road;
                } else {
                    ctx.fillStyle = this.colors.land;
                }

                ctx.fillRect(px, py, step, step);
            }
        }

        // Draw landmarks
        for (const landmark of this.worldManager.landmarks) {
            const dx = landmark.position.x - playerPosition.x;
            const dz = landmark.position.z - playerPosition.z;
            const screenX = centerX + dx / this.scale;
            const screenY = centerY + dz / this.scale;

            // Only draw if within minimap bounds
            const distFromCenter = Math.sqrt((screenX - centerX) ** 2 + (screenY - centerY) ** 2);
            if (distFromCenter > this.size / 2 - 8) continue;

            // Landmark marker
            ctx.fillStyle = this.colors.landmark;
            ctx.strokeStyle = this.colors.landmarkBorder;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();

        // Draw player arrow in center
        this.drawPlayerArrow(centerX, centerY, playerRotationY + Math.PI);

        // Draw border
        ctx.strokeStyle = "rgba(244, 236, 221, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size / 2 - 1, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawPlayerArrow(x, y, rotationY) {
        const ctx = this.ctx;
        const arrowSize = 8;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotationY);

        // Arrow pointing up (forward direction)
        ctx.fillStyle = this.colors.playerArrow;
        ctx.beginPath();
        ctx.moveTo(0, -arrowSize);
        ctx.lineTo(-arrowSize * 0.6, arrowSize * 0.5);
        ctx.lineTo(0, arrowSize * 0.2);
        ctx.lineTo(arrowSize * 0.6, arrowSize * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(31, 76, 78, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    isWaterAt(worldX, worldZ) {
        // Simplified water detection based on terrain height
        const islandRadius = Math.sqrt((worldX * worldX) / (132 * 132) + (worldZ * worldZ) / (116 * 116));
        return islandRadius > 0.9;
    }

    isRoadAt(worldX, worldZ) {
        if (Math.abs(worldX) > 84 || Math.abs(worldZ) > 84) {
            return false;
        }
        const roadX = Math.abs((((worldX - 2) % 18) + 18) % 18 - 9) <= 1;
        const roadZ = Math.abs((((worldZ + 5) % 18) + 18) % 18 - 9) <= 1;
        return roadX || roadZ;
    }
}
