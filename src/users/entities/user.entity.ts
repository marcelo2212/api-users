import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar', name: 'name_user', length: 80 })
  name: string;

  @Column({
    nullable: false,
    type: 'varchar',
    name: 'email_user',
    length: 50,
    unique: true,
  })
  email: string;

  @Column({ type: 'date', name: 'birthday_user', nullable: false })
  birthday: Date;

  @Exclude()
  @Column({ nullable: false, type: 'varchar', name: 'password_user' })
  password: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(-3)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(-3)',
  })
  updatedAt: Date;

  @Exclude()
  @Column({ nullable: true, name: 'refresh_token_user', type: 'varchar' })
  hashedRefreshToken: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}
