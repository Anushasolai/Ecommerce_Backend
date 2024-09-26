import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Product } from "./ProductEntity";
import { Cart } from "./CartEntity";

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  cart: Cart;

  @Column()
  quantity: number;
}
