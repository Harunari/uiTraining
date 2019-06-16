"use strict";
window.onload = () => { };
function makeDraggable(evt) {
    new DraggableObject(evt.target);
}
class DraggableObject {
    constructor(svgTarget) {
        this.selectedElement = null;
        this.offset = { x: 0, y: 0 };
        this.transform = null;
        this.rootSvgElement = svgTarget;
        svgTarget.addEventListener('mousedown', e => this.startDrag(e));
        svgTarget.addEventListener('mousemove', e => this.drag(e));
        svgTarget.addEventListener('mouseup', () => this.endDrag());
        svgTarget.addEventListener('mouseleave', () => this.endDrag());
    }
    startDrag(event) {
        let eTarget = event.target;
        if (!eTarget) {
            return;
        }
        if (eTarget.classList.contains('draggable')) {
            this.selectedElement = eTarget;
            this.offset = this.initializeDragging(event);
        }
        else if (eTarget.parentNode.classList.contains('draggable-group')) {
            this.selectedElement = eTarget.parentNode;
            this.offset = this.initializeDragging(event);
        }
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
        const coordinate = DraggableObject.getMousePostion(event, this.rootSvgElement);
        this.transform.setTranslate(coordinate.x - this.offset.x, coordinate.y - this.offset.y);
    }
    endDrag() {
        this.selectedElement = null;
    }
    static getMousePostion(event, selectedElement) {
        let svgElement = selectedElement;
        let ctm = svgElement.getScreenCTM();
        return {
            x: (event.clientX - ctm.e) / ctm.a,
            y: (event.clientY - ctm.f) / ctm.d
        };
    }
    initializeDragging(event) {
        if (!this.selectedElement) {
            return { x: 0, y: 0 };
        }
        if (!this.rootSvgElement) {
            return { x: 0, y: 0 };
        }
        let offset = DraggableObject.getMousePostion(event, this.rootSvgElement);
        let transforms = this.selectedElement.transform.baseVal;
        if (transforms.numberOfItems === 0 ||
            transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            let translate = this.rootSvgElement.createSVGTransform();
            translate.setTranslate(0, 0);
            this.selectedElement.transform.baseVal.insertItemBefore(translate, 0);
        }
        this.transform = transforms.getItem(0);
        offset.x -= this.transform.matrix.e;
        offset.y -= this.transform.matrix.f;
        return offset;
    }
}
