import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { CartItem } from "./CartItemEntity";
import { User } from "./UserEntity";

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  cartItems: CartItem[];

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.carts)
  user: User;
}
