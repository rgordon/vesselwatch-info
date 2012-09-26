
#import "SudzCExamplesAppDelegate.h"
#import "WSFWSF_x0020_TerminalsExample.h"


@implementation SudzCExamplesAppDelegate

@synthesize window;

- (void)applicationDidFinishLaunching:(UIApplication *)application {

WSFWSF_x0020_TerminalsExample* example1 = [[WSFWSF_x0020_TerminalsExample alloc] init];
		[example1 run];


	[window makeKeyAndVisible];
}

@end
			