import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovimientoPage } from './movimiento.page';

describe('MovimientoPage', () => {
  let component: MovimientoPage;
  let fixture: ComponentFixture<MovimientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MovimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
