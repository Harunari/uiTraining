"use strict";
window.onload = function () {
    // const draggableObjects = document.getElementsByClassName("draggable");
    // for (let i = 0; i < draggableObjects.length; i++) {
    //   let element: Element = draggableObjects[i];
    //   new DraggableObject(<EventTarget>element)
    // }
};
function makeDraggable(evt) {
    new DraggableObject(evt.target);
}
var DraggableObject = /** @class */ (function () {
    function DraggableObject(svgTarget) {
        this.rootSvgElement = null;
        this.selectedElement = null;
        this.offset = { x: 0, y: 0 };
        svgTarget.addEventListener('mousedown', this.startDrag);
        svgTarget.addEventListener('mousemove', this.drag);
        svgTarget.addEventListener('mouseup', this.endDrag);
        svgTarget.addEventListener('mouseleave', this.endDrag);
    }
    DraggableObject.prototype.startDrag = function (event) {
        var target = event.target;
        if (!target) {
            return;
        }
        if (target.classList.contains('draggable')) {
            this.selectedElement = target;
            this.rootSvgElement = target.parentElement;
            this.offset = DraggableObject.initializeDragging(event, this.selectedElement, this.rootSvgElement);
        }
        else if (target.parentNode.classList.contains('draggable-group')) {
            this.selectedElement = target.parentNode;
            this.rootSvgElement = event.target.parentElement.parentElement;
            this.offset = DraggableObject.initializeDragging(event, this.selectedElement, this.rootSvgElement);
        }
    };
    DraggableObject.prototype.drag = function (event) {
        if (!this.rootSvgElement) {
            return;
        }
        if (!this.selectedElement) {
            return;
        }
        event.preventDefault();
        var coordinate = DraggableObject.getMousePostion(event, this.rootSvgElement);
        DraggableObject.transform.setTranslate(coordinate.x - this.offset.x, coordinate.y - this.offset.y);
    };
    DraggableObject.prototype.endDrag = function (event) {
        this.selectedElement = null;
    };
    DraggableObject.getMousePostion = function (event, selectedElement) {
        var svgElement = selectedElement;
        var ctm = svgElement.getScreenCTM();
        return {
            x: (event.clientX - ctm.e) / ctm.a,
            y: (event.clientY - ctm.f) / ctm.d
        };
    };
    DraggableObject.initializeDragging = function (event, selectedElement, rootSvgElement) {
        var offset = DraggableObject.getMousePostion(event, rootSvgElement);
        var transforms = selectedElement.transform.baseVal;
        if (transforms.length === 0 ||
            transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            var translate = rootSvgElement.createSVGTransform();
            translate.setTranslate(0, 0);
            selectedElement.transform.baseVal.insertItemBefore(translate, 0);
        }
        DraggableObject.transform = transforms.getItem(0);
        offset.x -= DraggableObject.transform.matrix.e;
        offset.y -= DraggableObject.transform.matrix.f;
        return offset;
    };
    return DraggableObject;
}());
