window.onload = () => { };

function makeDraggable(evt: Event) {
  new DraggableObject(<SVGSVGElement>evt.target);
}

interface ICoordinate {
  x: number;
  y: number;
}

class DraggableObject {
  private rootSvgElement: SVGSVGElement;
  private selectedElement: SVGSVGElement | null = null;
  private offset: ICoordinate = { x: 0, y: 0 };
  private transform: SVGTransform | null = null;


  constructor(svgTarget: SVGSVGElement) {
    this.rootSvgElement = svgTarget;
    svgTarget.addEventListener('mousedown', e => this.startDrag(e));
    svgTarget.addEventListener('mousemove', e => this.drag(e));
    svgTarget.addEventListener('mouseup', e => this.endDrag(e));
    svgTarget.addEventListener('mouseleave', e => this.endDrag(e));
  }

  private startDrag(event: Event) {
    let eTarget = <Element>event.target;
    if (!eTarget) { return; }

    if (eTarget.classList.contains('draggable')) {
      this.selectedElement = <SVGSVGElement>eTarget;
      this.offset = this.initializeDragging(event);
    } else if ((eTarget.parentNode as Element).classList.contains('draggable-group')) {
      this.selectedElement = <SVGSVGElement>eTarget.parentNode;
      this.offset = this.initializeDragging(event);
    }
  }
  private drag(event: Event) {
    if (!this.rootSvgElement) { return; }
    if (!this.selectedElement) { return; }
    if (!this.transform) { return; }

    event.preventDefault();
    const coordinate = DraggableObject.getMousePostion(<MouseEvent>event, this.rootSvgElement);
    this.transform.setTranslate(coordinate.x - this.offset.x, coordinate.y - this.offset.y);
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
  private initializeDragging(event: Event): ICoordinate {
    if (!this.selectedElement) { return { x: 0, y: 0 }; }
    if (!this.rootSvgElement) { return { x: 0, y: 0 }; }

    let offset = DraggableObject.getMousePostion(<MouseEvent>event, this.rootSvgElement);
    let transforms = this.selectedElement.transform.baseVal;
    if (transforms.numberOfItems === 0 ||
      transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
      let translate = this.rootSvgElement.createSVGTransform();
      translate.setTranslate(0, 0);
      this.selectedElement.transform.baseVal.insertItemBefore(translate, 0);
    }

    this.transform = transforms.getItem(0) as SVGTransform;
    offset.x -= this.transform.matrix.e;
    offset.y -= this.transform.matrix.f;
    return offset;
  }
}