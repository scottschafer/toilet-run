import { Directive, Input, ElementRef } from '@angular/core';
declare var $: any;

@Directive({
  selector: '[appScaleToWidth]'
})
export class ScaleToWidthDirective {

  @Input() appScaleToWidth : number;

  private lastWidth:number;
  private lastHeight:number;

  constructor( private elementRef: ElementRef) { 
  }

  ngDoCheck() {
    if (this.appScaleToWidth) {
      var e = $(this.elementRef.nativeElement);
      var width = e.width();
      var height = e.height();
      if (width != this.lastWidth || height != this.lastHeight) {
        this.lastWidth = width;
        this.lastHeight = height;

        var scaling = width / this.appScaleToWidth;
        e.children().css({
          width: ((100/scaling) + '%'),
          transform: ('scale(' + scaling + ')'),
          transformOrigin: '0 0'
        });
      }
    }
  }
}
