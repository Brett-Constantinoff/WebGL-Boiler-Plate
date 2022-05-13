main();

function main(){

    const fpsElement = document.querySelector("#fps");

    const app = new App();
    app.onStart();

    var then = 0.0;
    //main render loop
    function render(now) {
        now *= 0.001;
        const deltaTime = now - then;
        then = now;

        const fps = 1/ deltaTime;
        fpsElement.textContent = fps.toFixed(1);

        app.startFrame();
        app.update(deltaTime);
        app.render();
        app.endFrame();

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

