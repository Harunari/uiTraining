"use strict";
window.onload = () => { };
function makeDraggable(evt) {
    new DraggableObject(evt.target);
}
class ConfinedOption {
    constructor() {
        this.isConfined = false;
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        this.boundaryX1 = 10.5;
        this.boundaryX2 = 30;
        this.boundaryY1 = 2.2;
        this.boundaryY2 = 19.2;
    }
    calcRealm(svgGraphicElement) {
        if (!this.isConfined) {
            return;
        }
        let bbox = svgGraphicElement.getBBox();
        this.minX = this.boundaryX1 - bbox.x;
        this.maxX = this.boundaryX2 - bbox.x - bbox.width;
        this.minY = this.boundaryY1 - bbox.y;
        this.maxY = this.boundaryY2 - bbox.y - bbox.height;
    }
    getConstratedCoordinate(dx, dy) {
        if (!this.isConfined) {
            return { x: dx, y: dy };
        }
        if (dx < this.minX) {
            dx = this.minX;
        }
        else if (dx > this.maxX) {
            dx = this.maxX;
        }
        if (dy < this.minY) {
            dy = this.minY;
        }
        else if (dy > this.maxY) {
            dy = this.maxY;
        }
        return { x: dx, y: dy };
    }
}
class DraggableObject {
    constructor(svgTarget) {
        this.selectedElement = null;
        this.offset = { x: 0, y: 0 };
        this.transform = null;
        this.confinedOption = new ConfinedOption();
        this.rootSvgElement = svgTarget;
        svgTarget.addEventListener('mousedown', e => this.startDrag(e));
        svgTarget.addEventListener('mousemove', e => this.drag(e));
        svgTarget.addEventListener('mouseup', () => this.endDrag());
        svgTarget.addEventListener('mouseleave', () => this.endDrag());
    }
    startDrag(event) {
        let eTarget = event.target;
        if (eTarget.classList.contains('draggable')) {
            this.selectedElement = eTarget;
            this.offset = this.initializeDragging(event);
        }
        else if (eTarget.parentNode.classList.contains('draggable-group')) {
            this.selectedElement = eTarget.parentNode;
            this.offset = this.initializeDragging(event);
        }
        this.confinedOption.isConfined = eTarget.classList.contains('confine');
        this.confinedOption.calcRealm(eTarget);
    }
    drag(event) {
        if (!this.rootSvgElement) {
            return;
        }
        if (!this.selectedElement) {
            return;
        }
        if (!this.transform) {
            return;
        }
        event.preventDefault();
        const coordinate = this.getMousePostion(event);
        const dx = coordinate.x - this.offset.x;
        const dy = coordinate.y - this.offset.y;
        const fixedCoordinate = this.confinedOption.getConstratedCoordinate(dx, dy);
        this.transform.setTranslate(fixedCoordinate.x, fixedCoordinate.y);
        console.log(fixedCoordinate.y);
    }
    endDrag() {
        this.selectedElement = null;
    }
    initializeDragging(event) {
        if (!this.selectedElement) {
            return { x: 0, y: 0 };
        }
        if (!this.rootSvgElement) {
            return { x: 0, y: 0 };
        }
        const offset = this.getMousePostion(event);
        const transforms = this.selectedElement.transform.baseVal;
        if (transforms.numberOfItems === 0 ||
            transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            const translate = this.rootSvgElement.createSVGTransform();
            translate.setTranslate(0, 0);
            this.selectedElement.transform.baseVal.insertItemBefore(translate, 0);
        }
        this.transform = transforms.getItem(0);
        offset.x -= this.transform.matrix.e;
        offset.y -= this.transform.matrix.f;
        return offset;
    }
    getMousePostion(event) {
        const svgElement = this.rootSvgElement;
        const ctm = svgElement.getScreenCTM();
        return {
            x: (event.clientX - ctm.e) / ctm.a,
            y: (event.clientY - ctm.f) / ctm.d
        };
    }
}
