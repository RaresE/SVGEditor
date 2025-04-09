let editor, desen, selectie, selectieElipsa, selectieLinie;
let elementSelectat = null;
let mx = 0, my = 0, x0 = 0, y0 = 0;
let figura = 'rect';
let culoareLinie = '#000000';
let grosimeLinie = 2;
let culoareFundal = '#000000';
let istoricFiguri = [];
let mutareInCurs = false;

function desenare() {
    let pozitie = document.querySelector('#pozitie');
    pozitie.innerHTML = `x: ${mx}, y: ${my}`;
}

function setareCoordonateDreptunghi(dreptunghi, x0, y0, x1, y1) {
    const dreptX = Math.min(x0, x1);
    const dreptY = Math.min(y0, y1);
    const dreptW = Math.max(x1, x0) - Math.min(x1, x0);
    const dreptH = Math.max(y1, y0) - Math.min(y1, y0);

    dreptunghi.setAttribute('x', dreptX);
    dreptunghi.setAttribute('y', dreptY);
    dreptunghi.setAttribute('width', dreptW);
    dreptunghi.setAttribute('height', dreptH);
    dreptunghi.setAttribute('fill-opacity', 0.2);
}

function setareCoordonateElipsa(elipsa, x0, y0, x1, y1){
    const cx = (x0 + x1)/2;
    const cy = (y0 + y1)/2;
    const rx = Math.abs(x1 - x0)/2;
    const ry = Math.abs(y1 - y0)/2;

    elipsa.setAttribute('cx', cx);
    elipsa.setAttribute('cy', cy);
    elipsa.setAttribute('rx', rx);
    elipsa.setAttribute('ry', ry);  
    elipsa.setAttribute('fill-opacity', 0.2);
}

function setareCoordonateLinie(linie, x0, y0, x1, y1){
    linie.setAttribute('x1', x0);
    linie.setAttribute('y1', y0);
    linie.setAttribute('x2', x1);
    linie.setAttribute('y2', y1);   
}

function stergereFigura(){
    if(elementSelectat){

        istoricFiguri.push({//folosim pentru undo in cazul in care ne dorim sa recuperam o figura
            action: 'stergere',
            element: elementSelectat
        });

        elementSelectat.remove(elementSelectat);
        elementSelectat.classList.remove = 'selectat';
        elementSelectat = null;
    }
}

function selectareElement(e, element){
    e.preventDefault();
    if(elementSelectat === element){//deselectare prin click aplicat pe acelasi element
        elementSelectat.classList.remove('selectat');
        elementSelectat = null;
    }
    else{
        if (elementSelectat) {//cazul in care selectam alt element
            elementSelectat.classList.remove('selectat');
        }

        elementSelectat = element;
        elementSelectat.classList.add('selectat');
    }

    if(elementSelectat){
        const culoareInitialaLinie = document.querySelector('#culoareLinie');
        const grosimeInitialaLinie = document.querySelector('#grosimeLinie');
        const culoareInitialaFundal = document.querySelector('#culoareFundal');

        istoricFiguri.push({//folosim istoricFiguri pentru undo (retinem atributele unei figuri)
            element: elementSelectat,
            culoareLinie: culoareInitialaLinie,
            grosimeLinie: grosimeInitialaLinie,
            culoareFundal: culoareInitialaFundal    
        });

        culoareInitialaLinie.value = elementSelectat.getAttribute('stroke');//afisam atributele initiale in obiectele de tip input
        grosimeInitialaLinie.value = elementSelectat.getAttribute('stroke-width');
        culoareInitialaFundal.value = elementSelectat.getAttribute('fill');
        document.querySelector('#grosimeValoare').textContent = grosimeInitialaLinie.value;
    }
}

function undo(){
    if(istoricFiguri.length>0){
        const ultimaFigura = istoricFiguri.pop();

        if(ultimaFigura.action === 'stergere'){//cazul in care ultima operatie a fost stergerea
            const elementSters = ultimaFigura.element;
            desen.append(elementSters);
        } 
        else if(ultimaFigura.action === 'adauga'){//cazul in care ultima operatie a fost adaugarea unei figuri
            const elementAdaugat = ultimaFigura.element;
            elementAdaugat.remove();
        } 
        else{//cazul in care ultima operatie a fost modificarea unei figuri
            const element = ultimaFigura.element;
            element.setAttribute('stroke', ultimaFigura.culoareLinie);
            element.setAttribute('stroke-width', ultimaFigura.grosimeLinie);
            element.setAttribute('fill', ultimaFigura.culoareFundal);
        }
    }
}

function salvareDesenSVG(){
    const salvareElementContinut = document.querySelector('svg');
    const serializareXML = new XMLSerializer();
    const continutSalvareSVG = serializareXML.serializeToString(salvareElementContinut);
    const fisierBlob = new Blob([continutSalvareSVG], {type: 'image/svg+xml'});//creem un obiect de tip Blob si specificam si tipul de fisier
    const url = URL.createObjectURL(fisierBlob);
    const link = document.createElement('a');       
    link.href = url;
    link.download = 'desen.svg';
    document.body.append(link);
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
}

function mousemove(e) {
    mx = Math.round(e.x - editor.getBoundingClientRect().x);    
    my = Math.round(e.y - editor.getBoundingClientRect().y);

    desenare();

    if(mutareInCurs && elementSelectat){//cazul in care avem un element selectat si vrem sa fie mutat
        const dx = mx - x0;   
        const dy = my - y0;

        if(elementSelectat.tagName === 'line'){
            const x1 = parseFloat(elementSelectat.getAttribute('x1')) + dx;
            const y1 = parseFloat(elementSelectat.getAttribute('y1')) + dy;
            const x2 = parseFloat(elementSelectat.getAttribute('x2')) + dx;
            const y2 = parseFloat(elementSelectat.getAttribute('y2')) + dy;
            elementSelectat.setAttribute('x1', x1);
            elementSelectat.setAttribute('y1', y1);
            elementSelectat.setAttribute('x2', x2);
            elementSelectat.setAttribute('y2', y2);
        } 
        else if(elementSelectat.tagName === 'rect'){
            const x = parseFloat(elementSelectat.getAttribute('x')) + dx;
            const y = parseFloat(elementSelectat.getAttribute('y')) + dy;
            elementSelectat.setAttribute('x', x);
            elementSelectat.setAttribute('y', y);
        }
        else if(elementSelectat.tagName === 'ellipse'){
            const cx = parseFloat(elementSelectat.getAttribute('cx')) + dx;
            const cy = parseFloat(elementSelectat.getAttribute('cy')) + dy;
            elementSelectat.setAttribute('cx', cx);
            elementSelectat.setAttribute('cy', cy);
        }

        x0 = mx;
        y0 = my;
    }

    //Desenare cazul in care nu exista element selectat
    if(!elementSelectat){
        if(figura === 'line') {
            setareCoordonateLinie(selectieLinie, x0, y0, mx, my);
        } 
        else if (figura === 'ellipse') {
            setareCoordonateElipsa(selectieElipsa, x0, y0, mx, my);
        } 
        else if(figura === 'rect') {
            setareCoordonateDreptunghi(selectie, x0, y0, mx, my);
        }
    }
}

function mousedown() {
    x0 = mx;
    y0 = my;

    if(elementSelectat){//cazul in care avem un element selecat si incepem mutarea
        mutareInCurs = true;
        if(elementSelectat.tagName === 'line'){
            x0 = parseFloat(elementSelectat.getAttribute('x1'));
            y0 = parseFloat(elementSelectat.getAttribute('y1'));
        }
        else if(elementSelectat.tagName === 'rect'){
            x0 = parseFloat(elementSelectat.getAttribute('x'));
            y0 = parseFloat(elementSelectat.getAttribute('y'));
        }
        else if(elementSelectat.tagName === 'ellipse'){
            x0 = parseFloat(elementSelectat.getAttribute('cx'));
            y0 = parseFloat(elementSelectat.getAttribute('cy'));
        }   
    }
    else{
        if(figura === 'line'){
            selectieLinie.style.display = 'block'
            setareCoordonateLinie(selectieLinie, x0, y0, mx, my);
        }
        else if(figura === 'rect'){
            selectie.style.display = 'block';
            setareCoordonateDreptunghi(selectie, x0, y0, mx, my);
        }
        else if(figura === 'ellipse'){
            selectieElipsa.style.display = 'block';
            setareCoordonateElipsa(selectieElipsa, x0, y0, mx, my);
        }
    }
}

function mouseup() {
    if(mutareInCurs){
        mutareInCurs = false;//oprim mutarea figurii
    } else{
        let elementAdaugat = null;

        if(figura === 'line'){
            const linie = document.createElementNS(
                'http://www.w3.org/2000/svg', 'line');
            setareCoordonateLinie(linie, x0, y0, mx, my);
            linie.setAttribute('stroke', culoareLinie);
            linie.setAttribute('stroke-width', grosimeLinie);
            desen.append(linie);

            linie.addEventListener('contextmenu', (e) => selectareElement(e, linie));
            elementAdaugat = linie;
        }
        else if(figura === 'ellipse'){//creare elipsa si setare culori
            const elipsa = document.createElementNS(
                'http://www.w3.org/2000/svg', 'ellipse');  
            setareCoordonateElipsa(elipsa, x0, y0, mx, my);
            elipsa.setAttribute('stroke', culoareLinie);
            elipsa.setAttribute('stroke-width', grosimeLinie);
            elipsa.setAttribute('fill', culoareFundal);
            desen.append(elipsa);

            elipsa.addEventListener('contextmenu', (e) => selectareElement(e, elipsa));
            elementAdaugat = elipsa;
        }
        else if(figura === 'rect'){
            const rect = document.createElementNS(
                'http://www.w3.org/2000/svg', 'rect');
            setareCoordonateDreptunghi(rect, x0, y0, mx, my);
            rect.setAttribute('stroke', culoareLinie);
            rect.setAttribute('stroke-width', grosimeLinie);
            rect.setAttribute('fill', culoareFundal);
            desen.append(rect);

            rect.addEventListener('contextmenu', (e) => selectareElement(e, rect));
            elementAdaugat = rect;
        }

        if(elementAdaugat){//cazul in care ultima actiune a fost adaugarea unei figuri
            istoricFiguri.push({
                action: 'adauga',
                element: elementAdaugat
            });
        }

        selectieLinie.style.display = 'none';
        selectie.style.display = 'none';
        selectieElipsa.style.display = 'none';
    }
}   

function aplicatie() {
    editor = document.querySelector('#editor');
    desen = document.querySelector('#desen');
    selectie = document.querySelector('#selectie');
    selectieElipsa = document.querySelector('#selectieElipsa');
    selectieLinie = document.querySelector('#selectieLinie');

    editor.addEventListener('mousedown', mousedown);
    editor.addEventListener('mouseup', mouseup);
    editor.addEventListener('mousemove', mousemove);

    document.querySelector('#btnDreptunghi').addEventListener('click', () => {
        figura = 'rect';
        console.log('Figura desenată va fi un dreptunghi!');
    });

    document.querySelector('#btnElipsa').addEventListener('click', () => {
        figura = 'ellipse';
        console.log('Figura desenată va fi o elipsă!');
    });

    document.querySelector('#btnLinie').addEventListener('click', () => {
        figura = 'line';
        console.log('Se va desena o linie!');
    }); 

    document.querySelector('#grosimeLinie').addEventListener('input', ()=> {
        grosimeLinie = document.querySelector('#grosimeLinie').value;
        document.querySelector('#grosimeValoare').textContent = grosimeLinie;
        
        if(elementSelectat){//cazul in care avem element selectat si ne dorim sa schimbam grosimea
            elementSelectat.setAttribute('stroke-width', grosimeLinie);
        }
    });

    document.querySelector('#culoareLinie').addEventListener('input', ()=> {
        culoareLinie = document.querySelector('#culoareLinie').value;  

        if(elementSelectat){
            elementSelectat.setAttribute('stroke', culoareLinie);
        }
    });

    document.querySelector('#culoareFundal').addEventListener('input', ()=> {
        culoareFundal = document.querySelector('#culoareFundal').value;  

        if(elementSelectat){
            elementSelectat.setAttribute('fill', culoareFundal);
        }
    });

    document.querySelector('#btnStergere').addEventListener('click', stergereFigura);

    document.querySelector('#btnUndo').addEventListener('click', undo);

    document.querySelector('#btnSalvareSVG').addEventListener('click', salvareDesenSVG);

    val(desenare, 1000 / 30);
}
document.addEventListener('DOMContentLoaded', aplicatie);   