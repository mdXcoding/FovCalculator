const app = new Vue({
    el: '#app',
    methods:
    {
        /**
         * @returns {void}
         */
        init()
        {
            this.c = document.getElementById("fovCanvas");
            this.resizeCanvas();
        },
        resizeCanvas()
        {
            let containerWidth = document.getElementById("canvasContainer").offsetWidth;

            this.canvas = {
                width: containerWidth * 0.95,
                height: (containerWidth / 2) * 0.95,
                center: {
                    x: ((containerWidth / 2)) * 0.95,
                    y: (containerWidth / 4) * 0.95,
                }
            }

            // adjust globalScale
            this.globalScaleFactor = this.canvas.width < 400
                ? 1
                : this.canvas.width < 850
                    ? 3
                    : 4;

            this.drawRig();
        },
        /**
         * @param sourceX : number
         * @param sourceY : number
         * @param destX : number
         * @param destY : number
         * @param color : string
         * @param thickness : number
         * @returns {void}
         */
        drawLine(sourceX, sourceY, destX, destY, color = "black", thickness = 1)
        {
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = thickness;
            this.ctx.moveTo(sourceX, sourceY);
            this.ctx.lineTo(destX, destY);
            this.ctx.stroke();
            this.ctx.closePath();
        },
        /**
         * @param x : number
         * @param y : number
         * @param radius : number
         * @param startAngle : number
         * @param endAngle : number
         * @param {string} color
         * @param thickness : number
         * @returns {void}
         */
        drawCircle(x, y, radius, startAngle, endAngle, color = "black", thickness = 1)
        {
            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = thickness;
            this.ctx.arc(x, y, radius, startAngle, endAngle);
            this.ctx.stroke();
            this.ctx.closePath();
        },
        /**
         * @param text : string
         * @param x : number
         * @param y: number
         * @param align : string
         * @param color : string
         * @returns {void}
         */
        drawText(text, x, y, align = "center", color = "black")
        {
            this.ctx.textAlign = align;
            this.ctx.fillText(text, x, y);
        },
        /**
         * @returns {void}
         */
        drawRig()
        {
            this.ctx = this.c.getContext("2d");
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // main screen
            this.drawLine(
                this.canvas.center.x - (this.globalScaleFactor *(this.displayInfo.width * 2.54) / 2),
                10,
                this.canvas.center.x + (this.globalScaleFactor * (this.displayInfo.width * 2.54) / 2),
                10, 'green', 5);

            // head
            this.drawCircle(this.canvas.center.x, this.headPivot, this.headRadius, 0, 2 * Math.PI);

            // eye fov
            this.drawLine(
                this.canvas.center.x,
                this.headPivot,
                (100 * this.globalScaleFactor) * Math.cos(((this.settings.eyeFov - 180) / 2) * Math.PI / 180) + this.canvas.center.x,
                (100 * this.globalScaleFactor) * Math.sin(((this.settings.eyeFov - 180) / 2) * Math.PI / 180) + this.headPivot,
                'red'
            );
            this.drawLine(
                this.canvas.center.x,
                this.headPivot,
                (100 * this.globalScaleFactor) * Math.cos((180 - (this.settings.eyeFov - 180) / 2) * Math.PI / 180) + this.canvas.center.x,
                (100 * this.globalScaleFactor) * Math.sin((180 - (this.settings.eyeFov - 180) / 2) * Math.PI / 180) + this.headPivot,
                'red'
            );

            this.drawText("Please note that these are just an estimate, real world could be different :)", this.canvas.center.x, this.canvas.height - 20);

            // side monitors
            if (this.settings.multipleScreens)
            {
                // declare pivots for main screen
                let leftPivot = (this.canvas.width / 2) - (this.globalScaleFactor * (this.displayInfo.width * 2.54) / 2);
                let rightPivot = (this.canvas.width / 2) + (this.globalScaleFactor * (this.displayInfo.width * 2.54) / 2);

                // calculate outer points of screens
                let leftScreenOuterX = (this.displayInfo.width * 2.54 * this.globalScaleFactor) * Math.cos((180 - this.tripleAngle) * Math.PI / 180) + leftPivot;
                let screenOuterY = (this.displayInfo.width * 2.54 * this.globalScaleFactor) * Math.sin(this.hAngle) + 10;
                let rightScreenOuterX = (this.displayInfo.width * 2.54 * this.globalScaleFactor) * Math.cos(this.hAngle) + rightPivot;

                this.drawLine(leftPivot, 10, leftScreenOuterX, screenOuterY, 'green', 5);
                this.drawLine(rightPivot, 10, rightScreenOuterX, screenOuterY, 'green', 5);

                // measures: screen to screen width
                let screenWidthMeasure = (rightScreenOuterX - leftScreenOuterX) / this.globalScaleFactor;
                this.drawLine(leftScreenOuterX,(this.headPivot + this.headRadius) * 1.15, leftScreenOuterX, (this.headPivot + this.headRadius) * 1.25);
                this.drawLine(rightScreenOuterX,(this.headPivot + this.headRadius) * 1.15, rightScreenOuterX, (this.headPivot + this.headRadius) * 1.25);
                this.drawLine(leftScreenOuterX,(this.headPivot + this.headRadius) * 1.2, rightScreenOuterX, (this.headPivot + this.headRadius) * 1.2);
                this.drawText(`~ ${this.getLabelValue(screenWidthMeasure)} ${this.getBaseUnit()}`, this.canvas.center.x, (this.headPivot + this.headRadius) * 1.25);

                // measures: screen to screen height
                let screenHeightMeasure  = (screenOuterY - 10) / this.globalScaleFactor;
                this.drawLine(leftScreenOuterX - 30, 10, leftScreenOuterX - 30, screenOuterY);
                this.drawLine(leftScreenOuterX - 40, 10, leftScreenOuterX - 20, 10);
                this.drawLine(leftScreenOuterX - 40, screenOuterY, leftScreenOuterX - 20, screenOuterY);
                this.drawText(`~ ${this.getLabelValue(screenHeightMeasure)} ${this.getBaseUnit()}`, leftScreenOuterX - 60, ((screenOuterY - 10) / 2));

                // measures: screen angles
                this.drawCircle(leftPivot, 10, 40, 0, ((180 - this.tripleAngle) * Math.PI / 180));
                this.drawText(`${Math.round(180 - this.tripleAngle)}°` , leftPivot, 30, 'left');
            }
        },
        /**
         * @returns {number}
         */
        calcAngle(baseInCm)
        {
            return Math.atan(baseInCm / 2 / this.settings.screenDistance) * 2;
        },
        /**
         * Get a label value based on the selected unit
         * @param {number} value
         * @return {string}
         */
        getLabelValue(value)
        {
            return this.settings.useMetric
                ? value.toFixed(2)
                : (value / 2.54).toFixed(2);
        },
        /**
         * Returns the base unit identifier
         * @return {string}
         */
        getBaseUnit()
        {
            return this.settings.useMetric
                ? 'cm'
                : 'inch';
        }
    },
    created()
    {
        this.init();
        window.addEventListener("resize", this.resizeCanvas);
    },
    mounted()
    {
        this.init();
    },
    destroyed()
    {
        window.removeEventListener("resize", this.resizeCanvas);
    },
    computed:
    {
        /**
         * @returns {number}
         */
        headPivot() {
            return 10 + this.headRadius + (this.settings.screenDistance * this.globalScaleFactor);
        },
        /**
         * @returns {number}
         */
        headRadius() {
            return 10 * this.globalScaleFactor;
        },
        /**
         * @returns {number}
         */
        fovHeight() {
            return Math.sin(Math.atan(this.screenRatio.y / this.screenRatio.x)) * (this.settings.screenSize * 2.54);
        },
        /**
         * @returns {number}
         */
        fovWidth() {
            let bezel = this.settings.multipleScreens
                ? (this.settings.bezelWidth / 10) * 2
                : 0;

            return Math.cos(Math.atan(this.screenRatio.y / this.screenRatio.x)) * ((this.settings.screenSize * 2.54) + bezel);
        },
        /**
         * @returns {number}
         */
        hAngle() {
            let rad = this.calcAngle(this.fovWidth);

            return rad < 2
                ? rad
                : 2;
        },
        /**
         * @returns {number}
         */
        vAngle() {
            return this.calcAngle(this.fovHeight);
        },
        /**
         * @returns {{x: number, y: number}}
         */
        screenRatio() {
            let ratio = this.settings.screenRatio.split(':');
            return {
                x: parseFloat(ratio[0]),
                y: parseFloat(ratio[1]),
            };
        },
        /**
         * @returns {number}
         */
        screenCount() {
            return this.settings.multipleScreens
                ? 3
                : 1;
        },
        /**
         * @returns {number}
         */
        tripleAngle() {
            let angle = this.hAngle * (180 / Math.PI);

            return angle < 90 ? angle : 90;
        },
        results() {
            let results = [];

            this.games.hFov.forEach(game => {
                let value = ((180 / Math.PI) * (this.hAngle * this.screenCount) * game.factor);

                results.push({
                    game: game.name,
                    text: value.toFixed(game.decimals) + game.unit
                });
            });

            this.games.vFov.forEach(game => {
                let value = ((180 / Math.PI) * (this.vAngle) * game.factor);

                results.push({
                    game: game.name,
                    text: value.toFixed(game.decimals) + game.unit
                });
            });


            results.push({
                game: "screen width",
                text: `~${this.getLabelValue(this.displayInfo.width * 2.54)} ${this.getBaseUnit()}`
            });

            results.push({
                game: "screen height",
                text: `~${this.getLabelValue(this.displayInfo.height * 2.54)} ${this.getBaseUnit()}`
            });

            return results;
        },
        displayInfo() {
            let calculatedDiagonal = Math.sqrt(Math.pow(this.screenRatio.x, 2) + Math.pow(this.screenRatio.y, 2));
            let factor = this.settings.screenSize / calculatedDiagonal;

            return {
                width: this.screenRatio.x * factor,
                height: this.screenRatio.y * factor,
            }
        },
        /**
         * Gets the bezel width label
         * @return {string}
         */
        bezelWidthLabel()
        {
            let value = this.settings.useMetric
                ? this.settings.bezelWidth
                : (this.settings.bezelWidth / 25.4).toFixed(2);

            let unit = this.settings.useMetric
                ? 'mm'
                : 'inch';

            return `${value} ${unit}`;
        },
        /**
         * Get screen distance label
         * @return {string}
         */
        screenDistanceLabel()
        {

            return `${this.getLabelValue(Number(this.settings.screenDistance))} ${this.getBaseUnit()}`;
        },
    },
    data() {
        return {
            c: null,
            ctx: null,
            errors: [],
            canvas: {
                x: 0,
                y: 0,
                center: {
                    x: 0,
                    y: 0,
                }
            },
            globalScaleFactor: 4,
            eyeFov: 220,
            screenRatios: [
                { name: "16:9" },
                { name: "16:10" },
                { name: "21:9" },
                { name: "32:9" },
                { name: "5:4" },
                { name: "4:3" },
            ],
            settings: {
                screenDistance: 60,
                screenSize: 32,
                screenRatio: "16:9",
                multipleScreens: true,
                eyeFov: 200,
                bezelWidth: 10,
                useMetric: true,
            },
            games: {
                hFov: [
                    {
                        name: "horizontal FOV",
                        factor: 1,
                        decimals: 0,
                        unit: "°"
                    }
                ],
                vFov: [
                    {
                        name: "vertical FOV",
                        factor: 1,
                        decimals: 0,
                        unit: "°"
                    }
                ],
            },
        }
    }
});
