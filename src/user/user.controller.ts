import {
  Controller,
  Param,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Patch,
  HttpCode,
  Req,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import {
  AddFundDTO,
  AddUserDTO,
  MultipleProfilesDTO,
  OtpSendDTO,
  OtpVerifyDRO,
  SellOwnEquity,
  UpdateUserDTO,
  UpdateUserPersonalInfoDTO,
  UserSetupDTO,

} from './user.DTOs';
import { FileInterceptor } from '@nestjs/platform-express';
import { app, bucket } from 'src/firebase';
import { SaveOptions } from '@google-cloud/storage';
import type { Holding, Post as MediaPost } from '@prisma/client';
import { HoldingService } from 'src/holdings/holdings.service';
import { UserService } from './UserService';
import { EmailService } from 'src/email/email.service';
import crypto from 'crypto';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import { ObjectId } from 'bson';
import { Request } from 'express';
// import { ObjectId } from 'mongodb'; // Add this import

dayjs.extend(duration);

@Controller('user')
export class UserController {
  constructor(
    private readonly pService: PrismaService,
    private readonly holdingService: HoldingService,
    private readonly userService: UserService,
    private readonly emailService:EmailService
  ) {}

  // Other existing methods...


  // @Get('dummy')
  // async dummyEndpoint() {
  //   return {
  //     statusCode: 200,
  //     message: 'Dummy API working successfully!',
  //     data: {
  //       example: 'Sample data for testing purposes',
  //     },
  //   };
  // }


  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))

  async updateProfileAndAvatar(
    @Req() req,
    @Body() body: UpdateUserDTO,

  ) {



    console.log(body.username)

    // Extract user data from request body
    const firebaseId = body.id;
    
    if (!firebaseId) {
      throw new BadRequestException('Firebase ID is required');
    }
    
    // Find user by Firebase ID
    const user = await  this.userService.findUserByFirebaseId(firebaseId)
    
    
    // Check if the user exists
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    
    // Extract user ID from the found user
    const userId = user.id;
    
    // Ensure the user ID is valid
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
  
    // Prepare data for updating user profile
    let updatedUserData = {
      dob: body.dob,
      mobile: body.mobile?.toString(),
      gender: body.gender,
      bio: body.bio,
      avatarPath: body.avatar,
      username:body.username
    };


    console.log('updatedUserData', updatedUserData)
    
    // Handle avatar file upload if provided

  
    // If avatar was included in the body, remove it to avoid conflicts
  
  
    // Delegate the update request to userService.updateUserProfile
    const updatedUser = await this.userService.updateUserProfile(userId, updatedUserData);
  
    // Return the updated user data
    return {
      status: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: updatedUser,
    };
  }



  

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: OtpVerifyDRO) {
    const user = await this.pService.user.findFirst({
      where: {
        email: body.email,
        activated: false,
      },
    });

    if (!user) throw new UnauthorizedException('user not found');
    if (
      user.otpSentTime &&
      dayjs.duration(user.otpSentTime.getUTCMilliseconds()).asMinutes() > 5
    )
      throw new BadRequestException('otp expired');

    if (+body.otp == user.otp) {
      // means the user is verified
      await app.auth().updateUser(user.firebaseId, { emailVerified: true });
      return this.pService.user.update({
        where: {
          id: user.id,
        },
        data: {
          verified: true,
        },
      });
    }
    throw new BadRequestException('OTP Verification failed');
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendVerificationotp(@Body() body: OtpSendDTO) {
    const user = await this.pService.user.findFirst({
      where: {
        email: body.email,
        activated: false,
      },
    });

    if (!user) throw new BadRequestException('user not found');
    if (
      user.otpSentTime &&
      dayjs
        .duration(user.otpSentTime.getUTCMilliseconds(), 'seconds')
        .asSeconds() < 10
    )
      throw new BadRequestException('cannot send another otp under 10 seconds');

    return this.userService.sendOTpEmail(body.email);
  }

  @Get('wallet')
  async getUserFinancialInfo(@Req() req) {
    // get holdings
    const holdings = await this.holdingService.getUserHoldings(req.user.id);

    // get user profile for calculating stats
    const stats = await this.pService.user.findFirst({
      where: {
        id: req.user.id,
      },
    });

    // TODO : change 1 to the value
    // calculate total investment
    let ttlInvestment = 0;
    let ttlReturns = 0;

    for (const holding of holdings) {
      ttlInvestment += holding.investedInr;
      ttlReturns += holding.amount * holding.sellerUser.price;
    }

    const tiiys = await this.pService.holding.findMany({
      where: {
        sellerUser: {
          id: req.user.id,
        },
      },
      include: {
        buyerUser: {
          select: {
            username: true,
          },
        },
        sellerUser: {
          select: {
            price: true,
          },
        },
      },
    });

    if (ttlInvestment < 1) ttlInvestment = 0;

    return {
      holdings,
      ttlInvestment: ttlInvestment,
      ttlReturns: ttlReturns - ttlInvestment,
      balance: stats?.balance,
      tiiys,
    };
  }

  @Get('username/:username')
  getUser(@Param('username') username) {
    return this.pService.user.findFirst({
      where: {
        username: username,
      },
    });
  }

  @Post('like/:id')
  async likePost(@Param('id') id, @Req() req) {
    await this.pService.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        PostsLiked: {
          connect: {
            id: id,
          },
        },
      },
    });

    return id;
  }

  @Post('unLike/:id')
  async dislikePOst(@Param('id') id, @Req() req) {
    await this.pService.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        PostsLiked: {
          disconnect: {
            id: id,
          },
        },
      },
    });
    return id;
  }

  // feeds algorithim
  @Get('feed')
  async getUserFeeds(@Req() req) {
    const page = parseInt(req.query.page) ?? 0;
    const perPage = 10;
  
    // Fetch the current user and the IDs of users they are following
    const user = await this.pService.user.findFirst({
      where: {
        id: req.user.id,
      },
      select: {
        following: {
          select: {
            id: true,
          },
        },
      },
    });
  
    const followingUserIds = (user?.following ?? []).map((fUser) => fUser.id);
  
    // Fetch the posts from the users the current user is following
    const posts = await this.pService.post.findMany({
      where: {
        userId: {
          in: followingUserIds,
        },
      },
      orderBy: {
        created: 'desc',
      },
      take: perPage,
      skip: page * perPage,
      include: {
        User: {
          select: {
            username: true,
            avatarPath: true,
            id: true,
            price: true,
          },
        },
      },
    });
  
    // Fetch all popular profiles
    const popularProfiles = await this.pService.popularProfile.findMany({
      where: {
        status: 1,
      },
      select: {
        userId: true,
      },
    });
  
    const popularProfileUserIds = new Set(popularProfiles.map(profile => profile.userId));
  
    // Add the popular flag to each post
    const postsWithPopularity = posts.map(post => ({
      ...post,
      popular: popularProfileUserIds.has(post.userId),
    }));
  
    return {
      page,
      perPage,
      total: await this.pService.post.count({
        where: {
          userId: { in: followingUserIds },
        },
      }),
      posts: postsWithPopularity,
    };
  }
  

  @Post('follow/:id')
  async followUser(@Param('id') id, @Req() req) {
    return this.pService.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        following: {
          connect: {
            id: id,
          },
        },
      },
    });
  }





  @Post('unfollow/:id')
  unfollowUser(@Param('id') id, @Req() req) {
    return this.pService.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        following: {
          disconnect: {
            id: id,
          },
        },
      },
    });
  }

  @Post('profiles')
  async getMultipleUserProfile(@Body() profiles: MultipleProfilesDTO) {
    // Filter out invalid ObjectIDs
    const validProfiles = profiles.filter(id => ObjectId.isValid(id));
  
    if (validProfiles.length === 0) {
      throw new Error('No valid ObjectIDs provided.');
    }
  
    const data = await this.pService.user.findMany({
      where: {
        id: { in: validProfiles },
      },
      select: {
        id: true,
        username: true,
        avatarPath: true,
      },
    });
  
    return data;
  }
 
  @Get()
  async getUserId(@Req() req) {
    const user = await this.pService.user.findFirst({
      where: {
        id: req.user.id,
      },
      include: {
        PaymentMethod: true,
      },
    });

    if (!user)
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);

    const wallet_vars = await this.userService.getSelfOwnEquiryVars(user);

    const INRLocked = (
      await this.pService.holding.findMany({
        where: {
          seller_id: user.id,
        },
      })
    ).reduce((acc, curr) => acc + curr.amount * user.price, 0);

    // Generate and send graph data
    const userTxns = await this.pService.transaction.findMany({
      where: {
        seller_id: user.id,
        type: {
          not: '',
        },
      },
      orderBy: {
        created: 'asc',
      },
      take: 10,
    });

    const graphData = this.userService.generateGraphData(userTxns);

    return {
      ...user,
      INRLocked: INRLocked,
      ...wallet_vars,
      platformEquity: user.platformEquity,
      posts: await this.pService.post.count({ where: { userId: user.id } }),
      graphData,
    };
  }

  @Post('new-signup')
  @HttpCode(HttpStatus.OK)
  async addUser(@Body() body: AddUserDTO) {
    try {


      console.log('body', body)

      // Check if the email already exists
      const existingUser = await this.pService.user.findUnique({
        where: {
          email: body.email,
        },
      });
  
      if (existingUser) {
        // If the email exists and the user is verified, throw a conflict exception
        if (existingUser.verified) {
          throw new HttpException('User already exists', HttpStatus.CONFLICT);
        } else {
          // If the email exists and the user is not verified, update the existing record
          const otp = this.userService.generateOTP(4);
          const user = await this.pService.user.update({
            where: {
              email: body.email,
            },
            data: {
              username: body.username,
              firebaseId: body.firebaseId,
              shares: 0,
              lastSell: {
                equity: 0,
                time: new Date(0),
              },
              otp: +otp,
              otpSentTime: new Date(),
              activated: false, // Ensure activated is set to false
            },
          });
        
          return { message: 'User updated successfully', user };
        }
      } else {
        // If the email does not exist, create a new user
        const otp = this.userService.generateOTP(4);
        const user = await this.pService.user.create({
          data: {
            email: body.email,
            username: body.username,
            firebaseId: body.firebaseId,
            shares: 0,
            lastSell: {
              equity: 0,
              time: new Date(0),
            },
            otp: +otp,
            otpSentTime: new Date(),
            activated: false, // Ensure activated is set to false for new users
          },
        });
        await this.userService.sendOTpEmail(user.email, otp);
        return { message: 'User created successfully', user };
      }
    } catch (err) {
      console.error('Error occurred:', err); // Log detailed error
  
      if (err.code === 'P2002') {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      } else {
        throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
  
  

  @Post('setup')
  async setUp(@Body() body: UserSetupDTO, @Req() req) {
    return this.pService.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        shares: body.shares_dilute,
        userEquity: body.equity_shares,
        activated: true,
      },
    });
  }

  @Get('search/:name')
  searchUserByName(@Param('name') name, @Req() req) {
    return this.pService.user.findMany({
      where: {
        username: {
          contains: name,
          mode: 'insensitive',
        },

        id: {
          not: req.user.id,
        },
      },
    });
  }

  @Get('feeds/:username')
  async getUserByUsername(@Param('username') username, @Req() req) {
    const page = parseInt(req.query.page) ?? 0;
    const perPage = 10;

    const posts = await this.pService.post.findMany({
      where: {
        User: {
          username: username,
        },
      },
      include: {
        User: true,
      },

      skip: page * perPage,
      take: perPage,

      orderBy: {
        created: 'desc',
      },
    });

    return {
      page,
      perPage,
      total: await this.pService.post.count({
        where: {
          User: { username },
        },
      }),
      posts,
    };
  }

  @Post('sell-own-equity')
  @HttpCode(HttpStatus.OK)
  async sellOwnEquity(@Req() req, @Body() body: SellOwnEquity) {
    await this.userService.sellPlatformEquity(req.user.id, body.percentage);

    return 'Sold';
  }


  @Get('suggestions/users')
  async getSuggetedUsers(@Req() req) {
    // Fetch suggested users
    const users = await this.pService.user.findMany({
      where: {
        activated: true,
        NOT: {
          followers: {
            some: { id: req.user.id },
          },
        },
      },
      take: 10,
      orderBy: { Posts: { _count: 'desc' } },
    });
  
    // Filter out specific user IDs
    const filteredUsers = users.filter(
      (user) =>
        ![
          '657b12dfe1040ebf6d05e6d7',
          req.user.id,
          '657b14c8e1040ebf6d05e6d9',
        ].includes(user.id),
    );
  
    // Fetch all popular profiles
    const popularProfiles = await this.pService.popularProfile.findMany({
      where: {
        status: 1,
      },
      select: {
        userId: true,
      },
    });
  
    const popularProfileUserIds = new Set(popularProfiles.map((profile) => profile.userId));
  
    // Add the popular flag to each user
    const usersWithPopularity = filteredUsers.map((user) => ({
      ...user,
      popular: popularProfileUserIds.has(user.id),
    }));
  
    return usersWithPopularity;
  }
  

  @Get('suggestions/pinned')
  async getPinnedUsers(@Req() req) {
    // Fetch the users by firebaseId
    const users = await this.pService.user.findMany({
      where: {
        firebaseId: {
          in: ['5fteNgu0H6Smy8khVlHlLQLNhuF2', 'UJ2XlRbfOJdpccwoDHInbtCzoGs2'],
        },
      },
    });
  
    // Fetch all popular profiles
    const popularProfiles = await this.pService.popularProfile.findMany({
      where: {
        status: 1,
      },
      select: {
        userId: true,
      },
    });
  
    const popularProfileUserIds = new Set(popularProfiles.map((profile) => profile.userId));
  
    // Add the popular flag to each user
    const usersWithPopularity = users.map((user) => ({
      ...user,
      popular: popularProfileUserIds.has(user.id),
    }));
  
    return usersWithPopularity;
  }
  

  @Get('followers/:username')
  async getFollowers(@Param('username') username: string, @Req() req) {
    return this.userService.getFollowerOrFollowings(username, {
      page: parseInt(req.query.page) ?? 0,
      type: 'followers',
    });
  }

  @Get('following/:username')
  async getFollowing(@Param('username') username: string, @Req() req) {
    return this.userService.getFollowerOrFollowings(username, {
      page: parseInt(req.query.page) ?? 0,
      type: 'following',
    });
  }

  @Post('add-fund')
  @HttpCode(HttpStatus.OK)
  async addFundRequest(@Req() req, @Body() body: AddFundDTO) {
    return this.userService.addFundReq(req.user.id, body);
  }

  @Patch('add-fund')
  @HttpCode(HttpStatus.OK)
  async updateFundStatus(@Req() req, @Body() body: AddFundDTO) {
    return this.userService.addFundReq(req.user.id, body);
  }

  @Post('personal-information')
  @HttpCode(HttpStatus.OK)
  async setUserPersonalInformation(
    @Req() req,
    @Body() body: UpdateUserPersonalInfoDTO,
  ) {
    await this.userService.updateUserInfo(req.user.id, body);
  }

  @Get(':id')
  async getPublicUser(@Param('id') id) {
    const user = await this.pService.user.findFirst({
      where: {
        id: id,
      },
      include: {
        Sold: true,
      },
    });

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const sharesAmountSold = user?.Sold.reduce(
      (prev: any, cur) => {
        prev?.amount ?? 0 + cur?.amount ?? 0;
      },
      { amount: 0 },
    );

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // generate and send it's graph data
    const userTxns = await this.pService.transaction.findMany({
      where: {
        seller_id: user.id,
      },
      orderBy: {
        created: 'asc',
      },
      take: 10,
    });

    const graphData = this.userService.generateGraphData(userTxns);

    // TODO
    const INRLocked = (
      await this.pService.holding.findMany({
        where: {
          seller_id: user.id,
        },
      })
    ).reduce((acc, curr) => acc + curr.investedInr, 0);

    return {
      sold: sharesAmountSold,
      ...user,
      userTxns,
      graphData,
      INRLocked: INRLocked,
      posts: await this.pService.post.count({ where: { userId: user.id } }),
    };
  }




  
  @Post('deleteAccountRequest')
  async deleteAccountRequest(@Req() req) {
    // Find the user by ID
    const user = await this.pService.user.findUnique({
      where: {
        id: req.user.id, // Assuming req.user.id contains the user's ID
      },
    });
  
    if (user) {
      let date = new Date();
  
      const notifData = {
        subject: `Account Deletion Request | ${user.username} | ` + date,
        body: `<h4>Delete Request From  : <b>${user.email}</b> </h4>
               <p><b>User ID: </b> ${user.id}</p>
               <p><b>Username : </b> ${user.username}</p>
               <p><b>Delete Reason:</b> ${req.body.reason}</p>
               <p>Visit Dashboard : <a href='https://dashboard.bluedibs.com' target='_blank'>BlueDibs Dashboard</a></p>`,
      };
  
      await this.emailService.sendNotifEmail(notifData);
  
      return { status: true, message: "We have received your delete request." };
    }
  
    return { status: false, message: "User not found." };
  }
  



  @Post('validateUserName')
  async validateUserName(@Req() req) {
    // Check if a username and email are provided in the request body
    if (!req.body.username || !req.body.email) {
      return { status: false, message: "Username and email are required." };
    }
  
    // Search for a user with the given username
    const user = await this.pService.user.findUnique({
      where: {
        username: req.body.username,
      },
    });
  
    // If a user with the same username exists
    if (user) {
      // Check if the email belongs to the same user
      if (user.email === req.body.email) {
        return { status: true, message: "Username is available." };
      } else {
        return { status: false, message: "Username already exists." };
      }
    }
  
    // If no user with the username exists, it's available
    return { status: true, message: "Username is available." };
  }
  

}
