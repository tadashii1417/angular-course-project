import {Directive, HostBinding, HostListener} from "@angular/core";

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective {
  @HostBinding('class.open') isOpen = false;

  @HostListener('mouseenter') toggleOpen() {
    this.isOpen = true;
  }
  @HostListener('mouseleave') removeOpen() {
    this.isOpen = false;
  }
}
