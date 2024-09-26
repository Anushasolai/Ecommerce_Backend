import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column({ type: "float" })
  price: number;

  @Column({ type: "float" })
  rating: number;

  @Column({ type: "varchar", nullable: true })
  image: string | null;
}
