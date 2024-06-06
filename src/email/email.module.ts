import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { PrismaService } from "src/Prisma.Service";
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from "path";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp-relay.brevo.com',
                secure: false,
                service: 'gmail',
                auth: {
                    user: 'weindic.inc@gmail.com',  // Your email address
                    pass: 'kgof qncb ogjv nroa'      // Your email password (or app password)
                },
                tls: {
                    rejectUnauthorized: false,
                },
            },
            defaults: {
                from: '"No Reply" <noreply@example.com>',
            },
            template: {
                dir: join(__dirname, '..', 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
    ],
    providers: [EmailService, PrismaService],
    exports: [EmailService],
})
export class EmailModule {}
