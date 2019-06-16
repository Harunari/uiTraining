window.onload = () => {
  // const draggableObjects = document.getElementsByClassName("draggable");
  // for (let i = 0; i < draggableObjects.length; i++) {
  //   let element: Element = draggableObjects[i];
  //   new DraggableObject(<EventTarget>element)
  // }
};

function makeDraggable(evt: Event) {
  new DraggableObject(<SVGSVGElement>evt.target);
}

interface ICoordinate {
  x: number;
  y: number;
}

class DraggableObject {
  private rootSvgElement: SVGSVGElement | null = null;
  private selectedElement: SVGSVGElement | null = null;
  private offset: ICoordinate = { x: 0, y: 0 };
  private static transform: SVGTransform;


  constructor(svgTarget: SVGSVGElement) {
    svgTarget.addEventListener('mousedown', this.startDrag);
    svgTarget.addEventListener('mousemove', this.drag);
    svgTarget.addEventListener('mouseup', this.endDrag);
    svgTarget.addEventListener('mouseleave', this.endDrag);
  }

  private startDrag(event: Event) {
    let target = <Element>event.target;
    if (!target) { return; }

    if (target.classList.contains('draggable')) {
      this.selectedElement = <SVGSVGElement>target;
      this.rootSvgElement = <SVGSVGElement><Element>target.parentElement;
      this.offset = DraggableObject.initializeDragging(event, this.selectedElement, this.rootSvgElement);
    } else if ((target.parentNode as Element).classList.contains('draggable-group')) {
      this.selectedElement = <SVGSVGElement>target.parentNode;
      this.rootSvgElement = <SVGSVGElement><Element>((event.target as Node).parentElement as Node).parentElement;
      this.offset = DraggableObject.initializeDragging(event, this.selectedElement, this.rootSvgElement);
    }
  }
  private drag(event: Event) {
    if (!this.rootSvgElement) { return; }
    if (!this.selectedElement) { return; }
    event.preventDefault();
    const coordinate = DraggableObject.getMousePostion(<MouseEvent>event, this.rootSvgElement);
    DraggableObject.transform.setTranslate(coordinate.x - this.offset.x, coordinate.y - this.offset.y);
  }
  private endDrag(event: Event) {
    this.selectedElement = null;
  }
  private static getMousePostion(event: MouseEvent, selectedElement: Element): ICoordinate {
    let svgElement = <SVGGraphicsElement>selectedElement;
    let ctm = <DOMMatrix>svgElement.getScreenCTM();
    return {
      x: (event.clientX - ctm.e) / ctm.a,
      y: (event.clientY - ctm.f) / ctm.d
    }
  }
  private static initializeDragging(event: Event, selectedElement: SVGSVGElement, rootSvgElement: SVGSVGElement): ICoordinate {
    let offset = DraggableObject.getMousePostion(<MouseEvent>event, rootSvgElement);
    let transforms = selectedElement.transform.baseVal;
    if (transforms.length === 0 ||
      transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
      let translate = rootSvgElement.createSVGTransform();
      translate.setTranslate(0, 0);
      selectedElement.transform.baseVal.insertItemBefore(translate, 0);
    }

    DraggableObject.transform = transforms.getItem(0) as SVGTransform;
    offset.x -= DraggableObject.transform.matrix.e;
    offset.y -= DraggableObject.transform.matrix.f;
    return offset;
  }
}