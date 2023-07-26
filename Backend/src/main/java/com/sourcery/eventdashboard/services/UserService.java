package com.sourcery.eventdashboard.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.microsoft.aad.msal4j.ClientCredentialFactory;
import com.microsoft.aad.msal4j.ClientCredentialParameters;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;
import com.microsoft.aad.msal4j.IAuthenticationResult;
import com.microsoft.aad.msal4j.IClientCredential;
import com.microsoft.graph.models.extensions.User;
import com.microsoft.graph.models.extensions.Group;
import com.microsoft.graph.requests.extensions.GraphServiceClient;

import java.net.MalformedURLException;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    @Value("${azure.activedirectory.client-secret}")
    private String CLIENT_SECRET;

    @Value("${azure.activedirectory.client-id}")
    private String CLIENT_ID;

    @Value("${azure.activedirectory.tenant-id}")
    private String TENANT;

    private String getGraphAccessToken() {
        ConfidentialClientApplication app = null;

        IClientCredential credential = ClientCredentialFactory.createFromSecret(CLIENT_SECRET);
        try {
            app = ConfidentialClientApplication.builder(CLIENT_ID, credential).authority("https://login.microsoftonline.com/" + TENANT + "/").build();
        }catch(MalformedURLException e) {
            System.out.println(e.getMessage());
        }

        ClientCredentialParameters parameters = ClientCredentialParameters.builder(Collections.singleton("https://graph.microsoft.com/.default")).build();

        CompletableFuture<IAuthenticationResult> future = app.acquireToken(parameters);

        try {
            IAuthenticationResult result = future.get();
            return result.accessToken();
        }catch(ExecutionException e){
            System.out.println(e.getMessage());
        }catch(InterruptedException e) {
            System.out.println(e.getMessage());
        }
        return null;        
    }

    public User getUserInformation(String oid) throws Exception {
        String accessToken = getGraphAccessToken();
        GraphServiceClient graphClient = (GraphServiceClient) GraphServiceClient.builder().authenticationProvider(request -> {
            request.addHeader("Authorization", "Bearer " + accessToken);
        }).buildClient();
        User user = graphClient.users(oid).buildRequest().get();
        return user;
    }

    public List<User> getAllUsers() throws Exception {
        GraphServiceClient graphClient = getGraphClient();

        List<User> users = graphClient.users()
            .buildRequest()
            .select("displayName,mail,id")
            .get()
            .getCurrentPage();
        
            return users;
    }

    private GraphServiceClient getGraphClient (){
        String accessToken = getGraphAccessToken();
        GraphServiceClient graphClient = (GraphServiceClient) GraphServiceClient.builder()
                .authenticationProvider(request -> {
                    request.addHeader("Authorization", "Bearer " + accessToken);
                })
                .buildClient();
        return graphClient;
    }

    public List<Group> getAllGroups() throws Exception {
        GraphServiceClient graphClient = getGraphClient();

        List<Group> groups = graphClient.groups()
                .buildRequest()
                .select("id,displayName,members")
                .expand("members($select=displayName,mail,id)")
                .get()
                .getCurrentPage();

        return groups;
    }
    
}
